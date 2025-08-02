import type { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { SyncLog, SyncOperation, SyncStatus } from "../models/SyncLog";

export class SyncService {
  private syncLogRepository: Repository<SyncLog>;

  constructor() {
    this.syncLogRepository = AppDataSource.getRepository(SyncLog);
  }

  async logChange(
    entityType: string,
    entityId: string,
    operation: SyncOperation,
    data: any,
    userId: string,
    branchId?: string,
  ) {
    const syncLog = this.syncLogRepository.create({
      entityType,
      entityId,
      operation,
      data,
      userId,
      branchId,
      status: SyncStatus.PENDING,
    });

    await this.syncLogRepository.save(syncLog);
    return syncLog;
  }

  async getPendingSync(userId: string, lastSyncAt?: Date) {
    const queryBuilder = this.syncLogRepository
      .createQueryBuilder("sync")
      .where("sync.userId = :userId", { userId })
      .andWhere("sync.status = :status", { status: SyncStatus.PENDING });

    if (lastSyncAt) {
      queryBuilder.andWhere("sync.createdAt > :lastSyncAt", { lastSyncAt });
    }

    queryBuilder.orderBy("sync.createdAt", "ASC");

    return await queryBuilder.getMany();
  }

  async markSynced(syncIds: string[]) {
    await this.syncLogRepository.update(
      { id: { $in: syncIds } as any },
      { status: SyncStatus.SUCCESS, syncedAt: new Date() },
    );
  }

  async markSyncFailed(syncId: string, error: any) {
    await this.syncLogRepository.update(
      { id: syncId },
      { status: SyncStatus.FAILED, error },
    );
  }

  async processOfflineChanges(
    changes: Array<{
      entityType: string;
      entityId: string;
      operation: SyncOperation;
      data: any;
      timestamp: Date;
    }>,
    userId: string,
    branchId: string,
  ) {
    const results = [];

    for (const change of changes) {
      try {
        // Process the change based on entity type and operation
        await this.processEntityChange(change);

        // Log successful sync
        await this.logChange(
          change.entityType,
          change.entityId,
          change.operation,
          change.data,
          userId,
          branchId,
        );

        results.push({
          entityType: change.entityType,
          entityId: change.entityId,
          status: "success",
        });
      } catch (error: any) {
        results.push({
          entityType: change.entityType,
          entityId: change.entityId,
          status: "failed",
          error: error.message,
        });
      }
    }

    return results;
  }

  private async processEntityChange(change: {
    entityType: string;
    entityId: string;
    operation: SyncOperation;
    data: any;
  }) {
    const repository = AppDataSource.getRepository(change.entityType);

    switch (change.operation) {
      case SyncOperation.CREATE:
        await repository.save(change.data);
        break;

      case SyncOperation.UPDATE:
        await repository.update(change.entityId, change.data);
        break;

      case SyncOperation.DELETE:
        await repository.update(change.entityId, { isDeleted: true });
        break;
    }
  }

  async getConflicts(userId: string, clientChanges: any[]) {
    const conflicts = [];

    for (const clientChange of clientChanges) {
      const serverLog = await this.syncLogRepository.findOne({
        where: {
          entityType: clientChange.entityType,
          entityId: clientChange.entityId,
          userId,
          createdAt: { $gt: clientChange.timestamp } as any,
        },
        order: { createdAt: "DESC" },
      });

      if (serverLog) {
        conflicts.push({
          entityType: clientChange.entityType,
          entityId: clientChange.entityId,
          clientData: clientChange.data,
          serverData: serverLog.data,
          clientTimestamp: clientChange.timestamp,
          serverTimestamp: serverLog.createdAt,
        });
      }
    }

    return conflicts;
  }
}
