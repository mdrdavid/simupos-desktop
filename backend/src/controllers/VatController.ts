import type { NextFunction, Request, Response } from "express";
import { VatService } from "../services/VatService";
import { vatSettingsSchema } from "../utils/validationSchemas";

export class VatController {
  private readonly vatService: VatService;

  constructor() {
    this.vatService = new VatService();
  }

  updateVatSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { error } = vatSettingsSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { businessId } = req.params;
      const result = await this.vatService.updateVatSettings(
        businessId,
        req.body,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
