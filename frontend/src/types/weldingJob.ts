export enum WeldingJobStatus {
  PENDING = "Pending",
  QUOTED = "Quoted",
  APPROVED = "Approved",
  IN_PROGRESS = "In Progress",
  AWAITING_MATERIALS = "Awaiting Materials", // Added from Job Progress section
  READY_FOR_PAINTING = "Ready for Painting", // Added from Job Progress section
  COMPLETED = "Completed",
  DELIVERED = "Delivered",
}

export interface WeldingMaterial {
  id: string; // Could be inventory item ID or a custom ID
  name: string;
  quantity: number;
  unit: string; // e.g., 'meters', 'kg', 'pieces'
  costPerUnit?: number; // Optional: if tracked
  isCustom: boolean; // True if not from existing inventory
}

export interface WeldingJob {
  id: string; // Unique identifier
  branchId: string; // Reference to the branch this job belongs to
  customerName: string;
  customerContact: string; // Phone or email
  customerLocation?: string; // Optional
  jobType: string; // e.g., gate, grill, door
  description: string; // Specs + Measurement
  materialsNeeded: WeldingMaterial[];
  estimatedCost: number;
  requiredDeliveryDate: string; // ISO date string
  status: WeldingJobStatus;
  // Fields for later steps
  activeQuoteId?: string; // ID of the active WeldingQuote
  activeInvoiceId?: string; // ID of the active WeldingInvoice
  // quoteId?: string; // Reference to SimuPOS quote - REMOVED for specific WelderQuote
  // invoiceId?: string; // Reference to SimuPOS invoice - REMOVED for specific WelderInvoice
  assignedArtisans?: string[];
  imageUploads?: { stage: string; uri: string; timestamp: string }[]; // For job progress
  deliveryConfirmed?: boolean;
  customerRating?: number; // 1-5 stars
  customerFeedback?: string;
  // Financials
  paymentsReceived?: { amount: number; date: string; method: string }[]; // This might be redundant if all payments are on WeldingInvoice
  expenses?: {
    id: string;
    description: string;
    amount: number;
    date: string;
    weldingJobId?: string;
  }[]; // Added id
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface WeldingMaterialStockItem {
  id: string; // Unique ID for this stock item (e.g., uuid)
  name: string; // e.g., "MS Rod 10mm", "Sheet Metal 2mm"
  unit: string; // e.g., "meters", "kg", "sheets", "pieces"
  quantityInStock: number;
  lowStockThreshold?: number; // Optional: for alerts
  supplierInfo?: string; // Optional: simple text for supplier details
  lastRestockDate?: string; // ISO Date
  notes?: string;
}
