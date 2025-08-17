import { AppDataSource } from "../config/database";
import { Business } from "../models";
import { ApiError } from "../utils/ApiError";
import type { Repository } from "typeorm";

export class VatService {
  private readonly businessRepository: Repository<Business>;

  constructor() {
    this.businessRepository = AppDataSource.getRepository(Business);
  }

  async updateVatSettings(
    businessId: string,
    vatData: { applyVAT: boolean; vatRate?: number },
    userId: string
  ) {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ["owner"],
    });

    if (!business) {
      throw new ApiError(404, "Business not found");
    }

    if (business.owner.id !== userId) {
      throw new ApiError(403, "You are not authorized to update this business");
    }

    business.applyVAT = vatData.applyVAT;
    business.vatRate = vatData.applyVAT ? vatData.vatRate : undefined;

    await this.businessRepository.save(business);

    return business;
  }
}
