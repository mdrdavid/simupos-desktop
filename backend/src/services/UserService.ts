import type { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { User, UserRole, UserStatus } from "../models/User";
import { ApiError } from "../utils/ApiError";
import bcrypt from "bcryptjs";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";
import { Subscription, SubscriptionStatus } from "../models/Subscription";

export class UserService {
  private userRepository: Repository<User>;
  private subscriptionRepository: Repository<Subscription>;
  private syncService: SyncService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.subscriptionRepository = AppDataSource.getRepository(Subscription);
    this.syncService = new SyncService();
  }

  async createUser(
    userData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password?: string;
      pin?: string;
      role: UserRole;
      branchId: string;
      status?: UserStatus;
      profilePicture?: string;
      address?: string;
    },
    createdById: string
  ) {
    // 1. Find the creator's subscription and user info
    const [creatorSubscription, creatorUser] = await Promise.all([
      this.subscriptionRepository.findOne({
        where: { userId: createdById, status: SubscriptionStatus.ACTIVE },
        relations: ["plan"],
      }),
      this.userRepository.findOne({
        where: { id: createdById },
        select: ["id", "firstName", "lastName"],
      }),
    ]);

    if (!creatorSubscription) {
      throw new ApiError(400, "No active subscription found for the creator");
    }

    if (!creatorUser) {
      throw new ApiError(400, "Creator user not found");
    }

    // 2. Check current user count against subscription limit
    const currentUserCount = await this.userRepository.count({
      where: { branchId: userData.branchId, isDeleted: false },
    });

    if (currentUserCount >= creatorSubscription.plan.maxUsers) {
      throw new ApiError(
        403,
        `You've reached the maximum users (${creatorSubscription.plan.maxUsers}) allowed by your subscription plan. Please upgrade to add more users.`
      );
    }

    // 3. Check for duplicate email or phone
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: userData.email, isDeleted: false },
        { phone: userData.phone, isDeleted: false },
      ],
    });

    if (existingUser) {
      throw new ApiError(400, "User with this email or phone already exists");
    }

    // 4. Set default values if not provided
    const password = userData.password || "12345678";
    const pin = userData.pin || "1234";

    // 5. Hash credentials
    const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const pinHash = await bcrypt.hash(pin, 12);

    // 6. Create user with creator info
    const user = this.userRepository.create({
      ...userData,
      passwordHash,
      pinHash,
      status: userData.status || UserStatus.ACTIVE,
      // createdBy: {
      //   id: creatorUser.id,
      //   name: `${creatorUser.firstName} ${creatorUser.lastName}`,
      // },
      createdBy: { id: creatorUser.id },
    });

    await this.userRepository.save(user);

    // 7. Assign the same subscription to the new user
    const userSubscription = this.subscriptionRepository.create({
      user: { id: user.id },
      plan: { id: creatorSubscription.plan.id },
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate: creatorSubscription.endDate,
      autoRenew: false,
      amount: creatorSubscription.amount,
      isDeleted: false,
      isTrial: false,
    });

    await this.subscriptionRepository.save(userSubscription);
    user.lastSubscriptionId = userSubscription.id;
    await this.userRepository.save(user);
    // 8. Log for sync
    await this.syncService.logChange(
      "User",
      user.id,
      SyncOperation.CREATE,
      { ...user, passwordHash: undefined, pinHash: undefined },
      createdById,
      user.branchId
    );

    // Return user without sensitive data
    const { passwordHash: _, pinHash: __, ...userResponse } = user;
    return userResponse;
  }

  // async createUser(
  //   userData: {
  //     firstName: string;
  //     lastName: string;
  //     email: string;
  //     phone: string;
  //     password?: string;
  //     pin?: string;
  //     role: UserRole;
  //     branchId: string;
  //     status?: UserStatus;
  //     profilePicture?: string;
  //     address?: string;
  //   },
  //   createdById: string
  // ) {
  //   // 1. Check current user count against subscription limit
  //   const currentUserCount = await this.userRepository.count({
  //     where: { branchId: userData.branchId, isDeleted: false },
  //   });

  //   const subscription = await this.subscriptionRepository.findOne({
  //     where: { userId: createdById, status: SubscriptionStatus.ACTIVE },
  //     relations: ["plan"],
  //   });

  //   if (!subscription) {
  //     throw new ApiError(400, "No active subscription found");
  //   }

  //   if (currentUserCount >= subscription.plan.maxUsers) {
  //     throw new ApiError(
  //       403,
  //       `You've reached the maximum users (${subscription.plan.maxUsers}) allowed by your subscription plan. Please upgrade to add more users.`
  //     );
  //   }

  //   // 2. Check for duplicate email or phone
  //   const existingUser = await this.userRepository.findOne({
  //     where: [
  //       { email: userData.email, isDeleted: false },
  //       { phone: userData.phone, isDeleted: false },
  //     ],
  //   });

  //   if (existingUser) {
  //     throw new ApiError(400, "User with this email or phone already exists");
  //   }

  //   // 3. Set default values if not provided
  //   const password = userData.password || "12345678";
  //   const pin = userData.pin || "1234";

  //   // 4. Hash credentials
  //   const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(10));
  //   const pinHash = await bcrypt.hash(pin, 12);

  //   // 5. Create user
  //   const user = this.userRepository.create({
  //     ...userData,
  //     passwordHash,
  //     pinHash,
  //     status: userData.status || UserStatus.ACTIVE,
  //   });

  //   await this.userRepository.save(user);

  //   // 6. Log for sync
  //   await this.syncService.logChange(
  //     "User",
  //     user.id,
  //     SyncOperation.CREATE,
  //     { ...user, passwordHash: undefined, pinHash: undefined },
  //     createdById,
  //     user.branchId
  //   );

  //   // Return user without sensitive data
  //   const { passwordHash: _, pinHash: __, ...userResponse } = user;
  //   return userResponse;
  // }

  async createUserMain(
    userData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password?: string;
      pin?: string;
      role: UserRole;
      branchId: string;
      status?: UserStatus;
      profilePicture?: string;
      address?: string;
    },
    createdById: string
  ) {
    // Check for duplicate email or phone
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: userData.email, isDeleted: false },
        { phone: userData.phone, isDeleted: false },
      ],
    });

    if (existingUser) {
      throw new ApiError(400, "User with this email or phone already exists");
    }

    // Set default values if not provided
    const password = userData.password || "12345678";
    const pin = userData.pin || "1234";

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const pinHash = await bcrypt.hash(pin, 12); // Hash the PIN
    const user = this.userRepository.create({
      ...userData,
      passwordHash,
      pinHash,
      status: userData.status || UserStatus.ACTIVE,
    });

    await this.userRepository.save(user);

    // Log for sync
    await this.syncService.logChange(
      "User",
      user.id,
      SyncOperation.CREATE,
      user,
      createdById,
      user.branchId
    );

    // Return user without sensitive data
    const { passwordHash: _, pinHash: __, ...userResponse } = user;
    return userResponse;
  }

  async updateUser(id: string, updateData: Partial<User>, updatedById: string) {
    const user = await this.userRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Handle password update
    if (updateData.passwordHash) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(
        updateData.passwordHash,
        salt
      );
      delete updateData.passwordHash;
    }

    // Handle PIN update
    if (updateData.pinHash) {
      const salt = await bcrypt.genSalt(10);
      updateData.pinHash = await bcrypt.hash(updateData.pinHash, salt);
      delete updateData.pinHash;
    }

    Object.assign(user, updateData);
    await this.userRepository.save(user);

    // Log for sync
    await this.syncService.logChange(
      "User",
      user.id,
      SyncOperation.UPDATE,
      user,
      updatedById,
      user.branchId
    );

    return user;
  }

  async getUsers(
    branchId: string,
    filters?: {
      search?: string;
      role?: UserRole;
      status?: UserStatus;
      page?: number;
      limit?: number;
    }
  ) {
    const queryBuilder = this.userRepository
      .createQueryBuilder("user")
      .where("user.branchId = :branchId", { branchId })
      .andWhere("user.isDeleted = false");

    if (filters?.search) {
      queryBuilder.andWhere(
        "(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.role) {
      queryBuilder.andWhere("user.role = :role", { role: filters.role });
    }

    if (filters?.status) {
      queryBuilder.andWhere("user.status = :status", {
        status: filters.status,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("user.lastName", "ASC");

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["branch", "branch.business"],
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }

  async softdeleteUser(id: string, deletedById: string) {
    const user = await this.userRepository.findOne({
      where: { id, isDeleted: false },
      relations: ["subscriptions"],
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.isDeleted = true;
    await this.userRepository.save(user);

    // Log for sync
    await this.syncService.logChange(
      "User",
      user.id,
      SyncOperation.DELETE,
      user,
      deletedById,
      user.branchId
    );

    return { message: "User deleted successfully" };
  }

  async deleteUser(id: string) {
    // Get user to be deleted with all relations
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["subscriptions", "branch", "ownedBusinesses"],
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Prevent deletion of users with owned businesses
    if (user.ownedBusinesses?.length) {
      throw new ApiError(
        400,
        "Cannot delete user who owns businesses. Transfer ownership first."
      );
    }

    // Use transaction for atomic operations
    await this.userRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Delete associated subscriptions
        await transactionalEntityManager.delete(Subscription, {
          userId: user.id,
        });

        // Delete user record
        await transactionalEntityManager.delete(User, { id: user.id });

        // Log for sync
        await this.syncService.logChange(
          "User",
          user.id,
          SyncOperation.PERMANENT_DELETE,
          {
            id: user.id,
            email: user.email,
            deletedAt: new Date(),
          },
          "system", // Use "system" as the actor since we removed deletedById
          user.branch?.id
        );
      }
    );

    return { message: "User permanently deleted successfully" };
  }
  async verifyCredentials(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email, isDeleted: false },
    });

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ApiError(403, "User account is not active");
    }

    return user;
  }

  async verifyPIN(userId: string, pin: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, isDeleted: false },
    });

    if (!user || !user.pinHash) {
      throw new ApiError(400, "PIN not set up for this user");
    }

    const isMatch = await bcrypt.compare(pin, user.pinHash);
    if (!isMatch) {
      throw new ApiError(401, "Invalid PIN");
    }

    return true;
  }

  async updateLastLogin(userId: string) {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  async getUsersByBranch(branchId: string) {
    return this.userRepository.find({
      where: { branchId, isDeleted: false },
      order: { lastName: "ASC" },
    });
  }
}
