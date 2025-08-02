import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Customer, CustomerType } from "../models/Customer";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";

export class CustomerService {
  private customerRepository: Repository<Customer>;
  private syncService: SyncService;

  constructor() {
    this.customerRepository = AppDataSource.getRepository(Customer);
    this.syncService = new SyncService();
  }

  async createCustomer(customerData: {
    name: string;
    phone: string;
    email?: string;
    gender?: string;
    birthday?: Date;
    customerType?: CustomerType
    notes?: string;
    branchId: string;
    userId: string;
  }) {
    const customer = this.customerRepository.create(customerData);
    await this.customerRepository.save(customer);

    await this.syncService.logChange(
      "Customer",
      customer.id,
      SyncOperation.CREATE,
      customer,
      customerData.userId,
      customerData.branchId
    );

    return customer;
  }

  async getCustomers(
    branchId: string,
    filters?: {
      search?: string;
      customerType?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const queryBuilder = this.customerRepository
      .createQueryBuilder("customer")
      .where("customer.branchId = :branchId", { branchId });

    if (filters?.search) {
      queryBuilder.andWhere(
        "(LOWER(customer.name) LIKE LOWER(:search) OR customer.phone LIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.customerType) {
      queryBuilder.andWhere("customer.customerType = :customerType", {
        customerType: filters.customerType,
      });
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("customer.createdAt", "DESC");

    const [customers, total] = await queryBuilder.getManyAndCount();

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerById(id: string) {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }

    return customer;
  }

  async updateCustomer(
    id: string,
    updateData: Partial<Customer>,
    userId: string
  ) {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }

    Object.assign(customer, updateData);
    await this.customerRepository.save(customer);

    await this.syncService.logChange(
      "Customer",
      customer.id,
      SyncOperation.UPDATE,
      customer,
      userId,
      customer.branchId
    );

    return customer;
  }

  async deleteCustomer(id: string, userId: string) {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }

    // FIRST log the change while customer still exists
    await this.syncService.logChange(
      "Customer",
      customer.id,
      SyncOperation.DELETE,
      customer,
      userId,
      customer.branchId
    );

    // THEN delete the customer
    await this.customerRepository.remove(customer);

    return { message: "Customer deleted successfully" };
  }

  async getCustomerAnalytics(branchId: string) {
    const queryBuilder = this.customerRepository
      .createQueryBuilder("customer")
      .where("customer.branchId = :branchId", { branchId });

    const customers = await queryBuilder.getMany();

    const totalCustomers = customers.length;
    const totalSpend = customers.reduce(
      (sum, customer) => sum + customer.totalSpend,
      0
    );
    const averageSpend = totalCustomers > 0 ? totalSpend / totalCustomers : 0;

    const byType = customers.reduce(
      (acc, customer) => {
        acc[customer.customerType] = (acc[customer.customerType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalCustomers,
      totalSpend,
      averageSpend,
      byType,
      vipCount: byType["VIP"] || 0,
      wholesaleCount: byType["Wholesale"] || 0,
    };
  }
}
