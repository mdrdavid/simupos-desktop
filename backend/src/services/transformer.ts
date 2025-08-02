import { Item } from "../models";
import { FrontendItem } from "../types/item.types";

export class ItemTransformer {
  static toFrontend(item: Item): FrontendItem {
    return {
      id: item.id,
      name: item.name,
      sellingPrice: item.sellingPrice,
      purchasePrice: item.purchasePrice,
      stockQuantity: item.stockQuantity,
      minStockLevel: item.minStockLevel,
      category: item.category,
      branchId: item.branchId,
      profitPerUnit: item.profitPerUnit ?? this.calculateProfitPerUnit(item),
      profitMargin: item.profitMargin ?? this.calculateProfitMargin(item),
      barcode: item.barcode,
      isActive: item.isActive,
      productType: item.productType,
      unit: item.unit,
      subUnit: item.subUnit,
      conversionFactor: item.conversionFactor,
      rawMaterials: item.rawMaterials,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  static toBackend(frontendItem: FrontendItem): Partial<Item> {
    return {
      name: frontendItem.name,
      sellingPrice: frontendItem.sellingPrice,
      purchasePrice: frontendItem.purchasePrice,
      stockQuantity: frontendItem.stockQuantity ?? 0,
      minStockLevel: frontendItem.minStockLevel ?? 0,
      category: frontendItem.category,
      branchId: frontendItem.branchId,
      barcode: frontendItem.barcode,
      isActive: frontendItem.isActive !== false, // default to true if not specified
      productType: frontendItem.productType ?? "retail", // default to retail
      unit: frontendItem.unit,
      subUnit: frontendItem.subUnit,
      conversionFactor: frontendItem.conversionFactor,
      rawMaterials: frontendItem.rawMaterials,
    };
  }

  private static calculateProfitPerUnit(item: Item): number {
    return item.purchasePrice ? item.sellingPrice - item.purchasePrice : 0;
  }

  private static calculateProfitMargin(item: Item): number {
    return item.purchasePrice && item.sellingPrice > 0
      ? ((item.sellingPrice - item.purchasePrice) / item.sellingPrice) * 100
      : 0;
  }
}
