// export interface AgroProduct {
//   id: string;
//   name: string;
//   description?: string;
//   category?: string;
//   baseCurrency: string;
//   hasVariants: boolean;
//   variants?: AgroProductVariant[];
//    unitOfMeasure: string; // e.g., "Kg", "Bag", "Liter", "Box"
//   // ... other existing fields ...
// }

export interface AgroProductVariant {
  id: string;
  name: string;
  description?: string;
  unitOfMeasure: string;
  currentAverageCostPrice: number;
  totalStockQuantity: number;
  minStockLevel?: number;
  productCode?: string;
  isActive: boolean;
  productId: string;
}

export interface StockShipment {
  id: string;
  costPrice: number;
  quantity: number;
  receivedDate: string;
  currency: string;
  supplierInfo?: string;
  type?: string;
  productId?: string;
  variantId?: string;
}

export interface AgroProductSaleItem {
  productId?: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  quantitySold: number;
  salePricePerUnit: number;
  costPricePerUnitAtSale: number;
  unitOfMeasure: string;
  currency: string;
  availableStock: number;
}
// export interface StockShipment {
//   id: string; // Unique ID for the shipment
//   costPrice: number;
//   quantity: number;
//   receivedDate: string; // ISO date string
//   currency: string; // e.g., "UGX", "USD"
//   supplierInfo?: string; // Optional: Name or ID of the supplier
// }

export interface AgroProduct {
  id: string; // Unique ID for the product
  name: string;
  category?: string;
  // Core dynamic pricing fields
  stockShipments: StockShipment[];
  currentAverageCostPrice: number; // Weighted average cost of current stock
  totalStockQuantity: number; // Sum of quantity from all relevant shipments

  // Fields for general product information, similar to existing Item
  baseCurrency: string; // The currency for currentAverageCostPrice, e.g., "UGX", "USD"
  unitOfMeasure: string; // e.g., "Kg", "Bag", "Liter", "Box"
  minStockLevel?: number;
  productCode?: string; // Optional: Barcode or internal code
  description?: string;
  isActive: boolean;
  branchId: string; // To associate with a specific branch
  hasVariants: boolean;
  variants?: AgroProductVariant[];
  // Timestamps
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// // This interface will be used when recording a sale of an AgroProduct
// // It captures the state of the product at the time of sale for accurate profit calculation
// export interface AgroProductSaleItem {
//   agroProductId: string;
//   quantitySold: number;
//   salePricePerUnit: number;
//   costPricePerUnitAtSale: number; // This will be the currentAverageCostPrice at the time of sale
//   unitOfMeasure: string; // e.g., "Kg", "Bag"
//   currency: string; // Currency of the sale price
// }
