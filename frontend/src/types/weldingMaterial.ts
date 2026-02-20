export interface WeldingMaterialStock {
  id: string;
  name: string;
  unit: string;
  quantityInStock: number;
  lowStockThreshold?: number;
  supplierInfo?: string;
  lastRestockDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  branchId: string;
  isDeleted: boolean;
}

export interface WeldingMaterialNeeded {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit?: number;
  isCustom: boolean;
  stockItemId?: string;
  weldingJobId: string;
  branchId: string;
  createdAt: string;
  updatedAt: string;
}
