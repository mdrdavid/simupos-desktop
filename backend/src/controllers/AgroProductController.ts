import { NextFunction, Request, Response } from "express";
import { AgroProductService } from "../services/AgroProductService";
import { ApiError } from "../utils/ApiError";
import {
  agroProductSchema,
  agroProductSchemaWeb,
  agroProductStockUpdateSchema,
  agroProductVariantSchema,
  stockShipmentWebSchema,
} from "../utils/validationSchemas";

export class AgroProductController {
  private service: AgroProductService;

  constructor() {
    this.service = new AgroProductService();
  }

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = agroProductSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const product = await this.service.createProduct(req.body, req.user.id);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  };

  createProductWeb = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Creating product via web interface");
      console.log("Request body:", req.body);
      // Validate request body against schema
      const { error, value } = agroProductSchemaWeb.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const errors = error.details.map((detail) => detail.message);
        res.status(400).json({ errors });
        return;
      }

      const { hasVariants, ...productData } = value;

      const product = await this.service.createProductWeb(
        productData,
        req.user.id
      );

      res.status(201).json({
        success: true,
        data: product,
        message: "Product created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

   createVariant = async(req: Request, res: Response, next: NextFunction) =>{
    try {
      const { error, value } = agroProductVariantSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        const errors = error.details.map((detail) => detail.message);
        res.status(400).json({ errors });
        return;
      }

      const { id } = req.params;
      const variant = await this.service.createVariant(id, value);

      res.status(201).json({
        success: true,
        data: variant,
        message: "Variant created successfully",
      });
    } catch (error) {
      next(error);
    }
  }
  addStockShipmentWeb = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Adding stock shipment via web interface");
      console.log("Request body:", req.body);
      const { error, value } = stockShipmentWebSchema.validate(req.body, {
        abortEarly: false
      });

      if (error) {
         res.status(400).json({
          success: false,
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
        return;
      }

      const { productId, variantId } = req.params;
      const shipment = await this.service.addStockShipmentWeb(
        productId,
        variantId || null,
        value,
        // value.branchId // Pass branchId from validated data
      );

      res.status(201).json({
        success: true,
        data: shipment,
        message: 'Stock shipment recorded successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  // async addStockShipmentWeb(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { error, value } = stockShipmentSchema.validate(req.body, {
  //       abortEarly: false,
  //     });

  //     if (error) {
  //       const errors = error.details.map((detail) => detail.message);
  //       res.status(400).json({ errors });
  //       return;
  //     }

  //     const { productId, variantId } = req.params;
  //     const shipment = await this.service.addStockShipmentWeb(
  //       productId,
  //       variantId || null,
  //       value
  //     );

  //     res.status(201).json({
  //       success: true,
  //       data: shipment,
  //       message: "Stock shipment added successfully",
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }
  getProductsByBranch = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { branchId } = req.params;
      const filters = {
        search: req.query.search as string,
        category: req.query.category as string,
        lowStock: req.query.lowStock === "true",
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };

      const result = await this.service.getProductsByBranch(branchId, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const product = await this.service.getProductById(id);
      res.json(product);
    } catch (error) {
      next(error);
    }
  };

  addStockShipment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { quantity, costPrice, currency, receivedDate, supplierInfo } =
        req.body;

      if (!quantity || quantity <= 0) {
        throw new ApiError(400, "Valid quantity is required");
      }

      const shipment = await this.service.addStockShipment(
        id,
        { quantity, costPrice, currency, receivedDate, supplierInfo },
        req.user.id
      );

      res.json(shipment);
    } catch (error) {
      next(error);
    }
  };

  updateProductStock = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      // Validate input
      const { error, value } = agroProductStockUpdateSchema.validate(req.body);
      if (error) {
        throw new ApiError(400, error.details[0].message);
      }

      const product = await this.service.updateProductStock(
        id,
        value.quantityChange,
        value.reason,
        req.user.id
      );

      res.json(product);
    } catch (error) {
      next(error);
    }
  };
}
