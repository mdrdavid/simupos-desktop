import type { Request, Response, NextFunction } from "express";
import { SyncService } from "../services/SyncService";
// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface User {
      id: string;
      branchId: string;
      // add other user properties if needed
    }
    interface Request {
      user: User;
    }
  }
}
export class SyncController {
  private syncService: SyncService;

  constructor() {
    this.syncService = new SyncService();
  }

  getPendingSync = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lastSyncAt } = req.query;
      const lastSync = lastSyncAt ? new Date(lastSyncAt as string) : undefined;

      const pendingChanges = await this.syncService.getPendingSync(
        req.user.id,
        lastSync,
      );
      res.json({ changes: pendingChanges });
    } catch (error) {
      next(error);
    }
  };

  syncOfflineChanges = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { changes } = req.body;

      if (!Array.isArray(changes)) {
        res.status(400).json({ error: "Changes must be an array" });
        return;
      }

      const results = await this.syncService.processOfflineChanges(
        changes,
        req.user.id,
        req.user.branchId,
      );

      res.json({ results });
    } catch (error) {
      next(error);
    }
  };

  resolveConflicts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { changes } = req.body;

      const conflicts = await this.syncService.getConflicts(
        req.user.id,
        changes,
      );
      res.json({ conflicts });
    } catch (error) {
      next(error);
    }
  };

  markSynced = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { syncIds } = req.body;

      if (!Array.isArray(syncIds)) {
        res.status(400).json({ error: "syncIds must be an array" });
        return;
      }

      await this.syncService.markSynced(syncIds);
      res.json({ message: "Changes marked as synced" });
    } catch (error) {
      next(error);
    }
  };
}
