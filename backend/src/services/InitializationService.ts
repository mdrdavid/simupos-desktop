import { AppDataSource } from "../config/database";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import { UserRole, UserStatus } from "../models/User";

export class InitializationService {
  async initializeDatabase() {
    await this.createSuperAdmin();
    // other initialization tasks here if needed
  }

  private async createSuperAdmin() {
    const userRepository = AppDataSource.getRepository(User);

    const existingAdmin = await userRepository.findOne({
      where: { email: "admin@simupos.com", isDeleted: false },
    });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash("12345678", 10);
      const pinHash = await bcrypt.hash("0000", 12);

      const superAdmin = userRepository.create({
        firstName: "Super",
        lastName: "Admin",
        email: "admin@simupos.com",
        phone: "+256711000000",
        passwordHash,
        pinHash,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        isActive: true,
      });

      await userRepository.save(superAdmin);
      console.log("Super admin user created successfully");
    }
  }
}
