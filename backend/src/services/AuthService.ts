import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { addMinutes } from "date-fns";
import type { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { UserRole } from "../models/User";
import { Branch, Business, User } from "../models";
import { ApiError } from "../utils/ApiError";
import { generateOTP, sendOTP } from "../utils/otpUtils";
import { SubscriptionPlanService } from "./SubscriptionPlanService";
import { SubscriptionService } from "./SubscriptionService";

export class AuthService {
  private userRepository: Repository<User>;
  private branchRepository: Repository<Branch>;
  private businessRepository: Repository<Business>;
  private subscriptionPlanService: SubscriptionPlanService;
  private subscriptionService: SubscriptionService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.branchRepository = AppDataSource.getRepository(Branch);
    this.businessRepository = AppDataSource.getRepository(Business);
    this.subscriptionPlanService = new SubscriptionPlanService();
    this.subscriptionService = new SubscriptionService();
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    pin: string;
    password: string;
  }) {
    // Validate PIN length (typically 4-6 digits)
    if (!userData.pin || userData.pin.length < 4 || userData.pin.length > 6) {
      throw new ApiError(400, "PIN must be 4-6 digits");
    }

    const existingUser = await this.userRepository.findOne({
      where: [{ email: userData.email }, { phone: userData.phone }],
    });

    if (existingUser) {
      throw new ApiError(400, "User already exists with this email or phone");
    }

    // 1. Create the business first using firstName
    const business = this.businessRepository.create({
      name: `${userData.firstName}'s Business`,
      phone: userData.phone,
    });
    await this.businessRepository.save(business);

    // 2. Create the main branch under the business
    const mainBranch = this.branchRepository.create({
      name: "Main Branch",
      isMain: true,
      isActive: true,
      business: business,
    });
    await this.branchRepository.save(mainBranch);

    const passwordHash = await bcrypt.hash(userData.password, 12);
    const pinHash = await bcrypt.hash(userData.pin, 12); // Hash the PIN

    // Generate and store OTP
    const otp = generateOTP(); // e.g., "123456"
    const otpExpiresAt = addMinutes(new Date(), 15); // OTP valid for 15 minutes
    const user = this.userRepository.create({
      ...userData,
      passwordHash,
      pinHash,
      branch: mainBranch,
      role: UserRole.OWNER,
      otpCode: otp,
      otpExpiresAt,
    });

    await this.userRepository.save(user);

    // Assign Free Trial subscription
    console.info(
      `Attempting to assign Free Trial subscription to user ${user.id}...`
    );
    try {
      const freeTrialPlan = await this.subscriptionPlanService.getTrialPlan();

      if (freeTrialPlan) {
        await this.subscriptionService.createSubscriptionForTrailPeriod(
          user.id,
          freeTrialPlan.id,
          "cash"
        );
        console.info(
          `Successfully assigned Free Trial subscription to user ${user.id}`
        );
      } else {
        console.warn(
          `Free Trial plan not found or not active. Skipping trial assignment for user ${user.id}.`
        );
      }
    } catch (error) {
      console.error(
        `Error assigning Free Trial subscription to user ${user.id}: `,
        error
      );
    }

    // 5. Update business with owner reference
    business.owner = user;
    await this.businessRepository.save(business);
    // Send OTP via SMS
    await sendOTP(userData.phone, otp);

    return {
      message: "User registered successfully. Please verify your phone number.",
      userId: user.id,
      businessId: business.id,
      branchId: mainBranch.id,
    };
  }

  async login(phone: string, pin: string) {
    // Validate inputs
    if (!phone || !pin) {
      throw new ApiError(400, "Phone and PIN are required");
    }

    const user = await this.userRepository.findOne({
      where: { phone },
      relations: ["branch", "branch.business", "ownedBusinesses"],
    });

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (!user.pinHash) {
      throw new ApiError(401, "PIN not set up for this user");
    }

    const isPinValid = await bcrypt.compare(pin, user.pinHash);
    if (!isPinValid) {
      throw new ApiError(401, "Invalid PIN");
    }

    if (user.status !== "active") {
      throw new ApiError(401, "Account is not active");
    }

    const token = this.generateToken(user.id);

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);
    // Get current subscription if exists
    let subscription = null;
    try {
      subscription = await this.subscriptionService.getCurrentSubscription(
        user.id
      );
    } catch (error) {
      // Ignore if no subscription found
    }
    return {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        subscriptionId: user.lastSubscriptionId,
        branch: user.branch,
        currentSubscription: subscription,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (user) {
      user.lastLogoutAt = new Date();
      await this.userRepository.save(user);
    }
  }
  async loginWithEmail(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ["branch"],
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (user.status !== "active") {
      throw new ApiError(401, "Account is not active");
    }

    const token = this.generateToken(user.id);

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        branch: user.branch,
      },
    };
  }

  async verifyOTP(userId: string, otp: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Check if OTP exists and is not expired
    if (!user.otpCode || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new ApiError(400, "OTP expired or invalid");
    }

    // Verify OTP matches
    if (user.otpCode !== otp) {
      throw new ApiError(400, "Invalid OTP");
    }

    // Clear OTP fields and mark phone as verified
    user.otpCode = "";
    user.otpExpiresAt = undefined;
    user.phoneVerifiedAt = new Date();
    await this.userRepository.save(user);

    return {
      message: "Phone number verified successfully",
      user: {
        id: user.id,
        phone: user.phone,
        phoneVerified: true,
      },
    };
  }

  async resendOTP(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiresAt = addMinutes(new Date(), 15);

    // Update user with new OTP
    user.otpCode = otp;
    user.otpExpiresAt = otpExpiresAt;
    await this.userRepository.save(user);

    // Send new OTP
    await sendOTP(user.phone, otp);

    return {
      message: "New OTP sent to your phone number",
      expiresAt: otpExpiresAt,
    };
  }

  async setupPIN(userId: string, pin: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const pinHash = await bcrypt.hash(pin, 12);
    user.pinHash = pinHash;
    await this.userRepository.save(user);

    return { message: "PIN setup successfully" };
  }

  async verifyPIN(userId: string, pin: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.pinHash) {
      throw new ApiError(401, "Invalid PIN");
    }

    const isValid = await bcrypt.compare(pin, user.pinHash);
    if (!isValid) {
      throw new ApiError(401, "Invalid PIN");
    }

    return { message: "PIN verified successfully" };
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    });
  }
}
