import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { CashRegisterSession, CashRegisterLog } from "../models";
import { CashRegisterStatus } from "../models/CashRegisterSession";
import { CashRegisterLogType } from "../models/CashRegisterLog";
import { ApiError } from "../utils/ApiError";
import { SyncService } from "./SyncService";
import { SyncOperation } from "../models/SyncLog";

export class CashRegisterService {
  private sessionRepository: Repository<CashRegisterSession>;
  private logRepository: Repository<CashRegisterLog>;
  private syncService: SyncService;

  constructor() {
    this.sessionRepository = AppDataSource.getRepository(CashRegisterSession);
    this.logRepository = AppDataSource.getRepository(CashRegisterLog);
    this.syncService = new SyncService();
  }

  async openSession(
    userId: string,
    branchId: string,
    openingFloat: number
  ): Promise<CashRegisterSession> {
    // Check for existing open session
    const existingSession = await this.sessionRepository.findOne({
      where: {
        userId,
        branchId,
        status: CashRegisterStatus.OPEN,
      },
    });

    if (existingSession) {
      throw new ApiError(400, "You already have an open cash register session");
    }

    // Create new session
    const session = this.sessionRepository.create({
      userId,
      branchId,
      openingFloat,
      openedAt: new Date(),
      status: CashRegisterStatus.OPEN,
    });

    const savedSession = await this.sessionRepository.save(session);

    // Log opening float
    await this.createLog({
      sessionId: savedSession.id,
      userId,
      type: CashRegisterLogType.OPENING_FLOAT,
      amount: openingFloat,
      reason: "Opening float for new session",
    });

    // Sync log
    await this.syncService.logChange(
      "CashRegisterSession",
      savedSession.id,
      SyncOperation.CREATE,
      savedSession,
      userId,
      branchId
    );

    return savedSession;
  }

  async closeSession(
    sessionId: string,
    userId: string,
    closingBalance: number,
    notes?: string
  ): Promise<CashRegisterSession> {
    const session = await this.getSessionById(sessionId);

    if (session.status !== CashRegisterStatus.OPEN) {
      throw new ApiError(400, "Session is not open");
    }

    if (session.userId !== userId) {
      throw new ApiError(403, "You can only close your own sessions");
    }

    // Calculate expected balance and discrepancy
    const expectedBalance = session.expectedCash;
    const discrepancy = Number(closingBalance) - expectedBalance;

    // Update session
    session.closedAt = new Date();
    session.closingBalance = closingBalance;
    session.expectedBalance = expectedBalance;
    session.discrepancy = discrepancy;
    session.notes = notes;
    session.status = CashRegisterStatus.CLOSED;

    const updatedSession = await this.sessionRepository.save(session);

    // Log closing balance
    await this.createLog({
      sessionId: session.id,
      userId,
      type: CashRegisterLogType.CLOSING_BALANCE,
      amount: closingBalance,
      reason: "Closing balance count",
      metadata: {
        expectedBalance,
        discrepancy,
        notes,
      },
    });

    // Sync log
    await this.syncService.logChange(
      "CashRegisterSession",
      updatedSession.id,
      SyncOperation.UPDATE,
      updatedSession,
      userId,
      session.branchId
    );

    return updatedSession;
  }

  async cashIn(
    sessionId: string,
    userId: string,
    amount: number,
    reason: string
  ): Promise<CashRegisterSession> {
    const session = await this.getSessionById(sessionId);

    if (session.status !== CashRegisterStatus.OPEN) {
      throw new ApiError(400, "Session is not open");
    }

    // Update session cash in amount
    session.cashIn = Number(session.cashIn) + Number(amount);
    const updatedSession = await this.sessionRepository.save(session);

    // Log cash in
    await this.createLog({
      sessionId: session.id,
      userId,
      type: CashRegisterLogType.CASH_IN,
      amount,
      reason,
    });

    // Sync log
    await this.syncService.logChange(
      "CashRegisterSession",
      updatedSession.id,
      SyncOperation.UPDATE,
      updatedSession,
      userId,
      session.branchId
    );

    return updatedSession;
  }

  async cashOut(
    sessionId: string,
    userId: string,
    amount: number,
    reason: string
  ): Promise<CashRegisterSession> {
    const session = await this.getSessionById(sessionId);

    if (session.status !== CashRegisterStatus.OPEN) {
      throw new ApiError(400, "Session is not open");
    }

    // Check if there's enough cash
    const expectedBalance = session.expectedCash;
    if (expectedBalance < Number(amount)) {
      throw new ApiError(400, "Insufficient cash in register");
    }

    // Update session cash out amount
    session.cashOut = Number(session.cashOut) + Number(amount);
    const updatedSession = await this.sessionRepository.save(session);

    // Log cash out
    await this.createLog({
      sessionId: session.id,
      userId,
      type: CashRegisterLogType.CASH_OUT,
      amount,
      reason,
    });

    // Sync log
    await this.syncService.logChange(
      "CashRegisterSession",
      updatedSession.id,
      SyncOperation.UPDATE,
      updatedSession,
      userId,
      session.branchId
    );

    return updatedSession;
  }

  async recordSale(
    sessionId: string,
    userId: string,
    amount: number,
    transactionId: string
  ): Promise<CashRegisterSession> {
    const session = await this.getSessionById(sessionId);

    if (session.status !== CashRegisterStatus.OPEN) {
      throw new ApiError(400, "Session is not open");
    }

    // Update total cash sales
    session.totalCashSales = Number(session.totalCashSales) + Number(amount);
    const updatedSession = await this.sessionRepository.save(session);

    // Log the sale
    await this.createLog({
      sessionId: session.id,
      userId,
      type: CashRegisterLogType.SALE,
      amount,
      reason: "Cash sale",
      referenceId: transactionId,
    });

    // Sync log
    await this.syncService.logChange(
      "CashRegisterSession",
      updatedSession.id,
      SyncOperation.UPDATE,
      updatedSession,
      userId,
      session.branchId
    );

    return updatedSession;
  }

  async getCurrentSession(
    userId: string,
    branchId: string
  ): Promise<CashRegisterSession | null> {
    return this.sessionRepository.findOne({
      where: {
        userId,
        branchId,
        status: CashRegisterStatus.OPEN,
      },
      relations: ["logs", "user", "branch"],
    });
  }

  async getSessionById(sessionId: string): Promise<CashRegisterSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ["user", "branch"],
    });

    if (!session) {
      throw new ApiError(404, "Session not found");
    }

    return session;
  }

  async getSessions(filters: {
    branchId?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: CashRegisterStatus;
    page?: number;
    limit?: number;
  }): Promise<{ sessions: CashRegisterSession[]; pagination: any }> {
    const queryBuilder = this.sessionRepository
      .createQueryBuilder("session")
      .leftJoinAndSelect("session.user", "user")
      .leftJoinAndSelect("session.branch", "branch");

    // Apply filters
    if (filters.branchId) {
      queryBuilder.andWhere("session.branchId = :branchId", {
        branchId: filters.branchId,
      });
    }

    if (filters.userId) {
      queryBuilder.andWhere("session.userId = :userId", {
        userId: filters.userId,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere("session.status = :status", {
        status: filters.status,
      });
    }

    if (filters.startDate) {
      queryBuilder.andWhere("session.openedAt >= :startDate", {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere("session.openedAt <= :endDate", {
        endDate: filters.endDate,
      });
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy("session.openedAt", "DESC");

    const [sessions, total] = await queryBuilder.getManyAndCount();

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getSessionLogs(
    sessionId: string,
    userId: string,
    isAdmin: boolean = false
  ): Promise<CashRegisterLog[]> {
    const session = await this.getSessionById(sessionId);

    // Check permissions
    if (session.userId !== userId && !isAdmin) {
      throw new ApiError(403, "Access denied");
    }

    return this.logRepository.find({
      where: { sessionId },
      relations: ["user"],
      order: { createdAt: "ASC" },
    });
  }

  async getDailySummary(
    branchId: string,
    userId: string,
    date: Date
  ): Promise<any> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const sessions = await this.sessionRepository.find({
      where: {
        userId,
        branchId,
        openedAt: {
          $gte: startDate,
          $lte: endDate,
        } as any,
      },
      relations: ["logs"],
    });

    return {
      totalSessions: sessions.length,
      openSessions: sessions.filter((s) => s.status === CashRegisterStatus.OPEN)
        .length,
      closedSessions: sessions.filter(
        (s) => s.status === CashRegisterStatus.CLOSED
      ).length,
      totalSales: sessions.reduce(
        (sum, s) => sum + Number(s.totalCashSales),
        0
      ),
      totalCashIn: sessions.reduce((sum, s) => sum + Number(s.cashIn), 0),
      totalCashOut: sessions.reduce((sum, s) => sum + Number(s.cashOut), 0),
      totalDiscrepancy: sessions.reduce(
        (sum, s) => sum + Number(s.discrepancy || 0),
        0
      ),
      sessions: sessions.map((session) => ({
        ...session,
        expectedBalance: session.expectedCash,
      })),
    };
  }

  private async createLog(logData: {
    sessionId: string;
    userId: string;
    type: CashRegisterLogType;
    amount: number;
    reason?: string;
    referenceId?: string;
    metadata?: any;
  }): Promise<CashRegisterLog> {
    const log = this.logRepository.create(logData);
    await this.logRepository.save(log);
    return log;
  }
}
