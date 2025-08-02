import { Repository } from "typeorm";
import { Transaction } from "../models";

export class TransactionIdService {
  constructor(private transactionRepository: Repository<Transaction>) {}

  async generateUniqueTransactionId(): Promise<string> {
    let isUnique = false;
    let transactionId = "";

    while (!isUnique) {
      // Generate 6-digit number
      transactionId = Math.floor(100000 + Math.random() * 900000).toString();

      // Check if it exists in database
      const exists = await this.transactionRepository.findOne({
        where: { transactionId },
      });

      if (!exists) {
        isUnique = true;
      }
    }

    return transactionId;
  }

  async generateSequentialId(branchId: string): Promise<string> {
    // Get the last transaction number for this branch
    const lastTransaction = await this.transactionRepository.findOne({
      where: { branchId },
      order: { createdAt: "DESC" },
    });

    let nextNumber = 1;
    if (lastTransaction?.transactionId) {
      const lastNumber = parseInt(lastTransaction.transactionId.slice(-6));
      nextNumber = lastNumber + 1;
    }

    // Pad with leading zeros
    return nextNumber.toString().padStart(6, "0");
  }
}
