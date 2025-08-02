import Joi from "joi";
// import { ExpenseCategory } from "../models/Expense";
import { UserRole, UserStatus } from "../models/User";
import { SubscriptionPlan } from "../models/SubscriptionPlan";

export const registerSchema = Joi.object({
  firstName: Joi.string().required().min(2).max(50),
  lastName: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .required()
    .pattern(/^\+?[1-9]\d{1,14}$/),
  pin: Joi.string().required().length(4).pattern(/^\d+$/),
  password: Joi.string().required().min(8),
  branchId: Joi.string().uuid().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const loginSchemaWithPin = Joi.object({
  phone: Joi.string()
    .required()
    .pattern(/^\+?[1-9]\d{1,14}$/),
  pin: Joi.string().required().length(4).pattern(/^\d+$/),
});

export const otpSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  otp: Joi.string().required().length(6),
});

export const pinSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  pin: Joi.string().required().length(4).pattern(/^\d+$/),
});

export const itemSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  description: Joi.string().optional().max(500),
  barcode: Joi.string().optional(),
  category: Joi.string().optional().max(50),
  sellingPrice: Joi.number().required().min(0),
  purchasePrice: Joi.number().optional().min(0),
  costPrice: Joi.number().optional().min(0),
  stockQuantity: Joi.number().required().min(0),
  minStockLevel: Joi.number().optional().min(0),
  unit: Joi.string().optional().max(20),
  branchId: Joi.string().uuid().required(),
  productType: Joi.string()
    .valid("retail", "service", "processed", "raw_material", "combo")
    .default("retail")
    .messages({
      "any.only":
        "Product type must be one of: retail, service, processed, raw_material, or combo",
    }),
  // Add related fields if needed
  subUnit: Joi.string().optional().max(20),
  conversionFactor: Joi.number().optional().min(0),
  rawMaterials: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.string().required(),
        quantityNeeded: Joi.number().required().min(0),
      })
    )
    .optional(),
});
export const saleSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.string().uuid().required(),
        quantity: Joi.number().required().min(1),
        unitPrice: Joi.number().required().min(0),
        discount: Joi.number().optional().min(0),
      })
    )
    .required()
    .min(1),
  paymentMethod: Joi.string()
    .valid("cash", "card", "mobile", "bank_transfer")
    .required(),
  amountPaid: Joi.number().required().min(0),
  customerName: Joi.string().optional().max(100),
  customerPhone: Joi.string().optional(),
  notes: Joi.string().optional().max(500),
});

export const branchSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  address: Joi.string().optional().max(255),
  phone: Joi.string().optional().max(20),
  email: Joi.string().email().optional(),
  manager: Joi.string().optional().max(100),
  isActive: Joi.boolean().default(true),
  settings: Joi.object().optional(),
});

export const branchUpdateSchema = Joi.object({
  name: Joi.string().optional().min(2).max(100),
  address: Joi.string().optional().max(255),
  phone: Joi.string().optional().max(20),
  email: Joi.string().email().optional(),
  manager: Joi.string().optional().max(100),
  isActive: Joi.boolean().optional(),
  settings: Joi.object().optional(),
});

export const expenseSchema = Joi.object({
  amount: Joi.number().positive().required(),
  category: Joi.string().required(),
  description: Joi.string().optional(),
  date: Joi.date().required(),
  paymentMethod: Joi.string().valid("cash", "bank", "mobile_money").required(),
  receiptNumber: Joi.string().optional(),
  vendor: Joi.string().optional(),
  isRecurring: Joi.boolean().default(false),
  branchId: Joi.string().required(),
});
export const expenseUpdateSchema = Joi.object({
  title: Joi.string().optional().min(2).max(100),
  description: Joi.string().optional().max(500),
  amount: Joi.number().optional().min(0),
  // category: Joi.string()
  //   .valid(...Object.values(ExpenseCategory))
  //   .optional(),
  category: Joi.string().optional(),
  expenseDate: Joi.date().optional(),
  receipt: Joi.string().optional(),
  vendor: Joi.string().optional().max(100),
  metadata: Joi.object().optional(),
});

export const userSchema = Joi.object({
  firstName: Joi.string().required().min(2).max(50),
  lastName: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .required()
    .pattern(/^\+?[1-9]\d{1,14}$/),
  password: Joi.string().required().min(6),
  pin: Joi.string().required().length(4).pattern(/^\d+$/),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required(),
  branchId: Joi.string().required(),
  status: Joi.string().valid(...Object.values(UserStatus)),
  profilePicture: Joi.string().uri(),
  address: Joi.string(),
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  phone: Joi.string(),
  password: Joi.string().min(6),
  role: Joi.string().valid(...Object.values(UserRole)),
  status: Joi.string().valid(...Object.values(UserStatus)),
  profilePicture: Joi.string().uri(),
  address: Joi.string(),
  pin: Joi.string()
    .length(4)
    .pattern(/^[0-9]+$/),
});

export const subscriptionSchema = Joi.object({
  planId: Joi.string().uuid().required(), // Changed from plan enum to planId
  paymentMethod: Joi.string()
    .valid("cash", "mtn_momo", "airtel_money")
    .required(),
  transactionId: Joi.string().optional(),
});
export const subscriptionPlanSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().min(0).required(),
  maxUsers: Joi.number().integer().min(1).required(),
  maxTransactions: Joi.number().integer().min(0).required(),
  features: Joi.array().items(Joi.string()).required(),
  isPopular: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
  isTrial: Joi.boolean().default(true),
  durationDays: Joi.number().integer().min(0).optional(),
});
export const subscriptionPlanUpdateSchema = Joi.object({
  name: Joi.string(),
  code: Joi.string(), // Still validate but not required
  description: Joi.string(),
  price: Joi.number().min(0),
  maxUsers: Joi.number().integer().min(1),
  maxTransactions: Joi.number().integer().min(0),
  features: Joi.array().items(Joi.string()),
  isPopular: Joi.boolean(),
  isActive: Joi.boolean(),
}).min(1); // At least one field should be provided for update

export const businessSchema = Joi.object({
  name: Joi.string().required().max(100),
  address: Joi.string().max(255).optional(),
  phone: Joi.string().max(20).optional(),
  email: Joi.string().email().max(100).optional(),
  taxNumber: Joi.string().max(50).optional(),
  applyVAT: Joi.boolean().default(false),
  vatRate: Joi.number().min(0).max(100).optional(),
  currency: Joi.string().default("UGX"),
  logo: Joi.string().uri().optional(),
  receiptFooter: Joi.string().max(255).optional(),
});

export const businessUpdateSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  address: Joi.string().optional().allow(""),
  phone: Joi.string().optional().allow(""),
  email: Joi.string().email().optional().allow(""),
  taxNumber: Joi.string().optional().allow(""),
  applyVAT: Joi.boolean().optional(),
  vatRate: Joi.number().optional(),
  currency: Joi.string().optional(),
  receiptFooter: Joi.string().optional().allow(""),
  businessType: Joi.string().optional().allow(""),
  logo: Joi.string().uri().optional(),
});
export const reportSchema = Joi.object({
  branchId: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date()
    .optional()
    .when("startDate", {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref("startDate")).required(),
    }),
});

export const transactionSchemaAgro = Joi.object({
  amount: Joi.number().positive().required(),
  paymentMethod: Joi.string()
    .valid("cash", "mtn_momo", "airtel_money")
    .required(),
  customerName: Joi.string().allow("", null).optional(),
  customerPhone: Joi.string().allow("", null).optional(),
  items: Joi.array()
    .items(
      Joi.object({
        agroProductId: Joi.string().required(), // Only agroProductId is required now
        price: Joi.number().positive().required(),
        quantity: Joi.number().positive().required(),
        purchasePrice: Joi.number().positive().allow(null).optional(),
        name: Joi.string().optional(),
        productType: Joi.string().optional(),
        unit: Joi.string().optional(),
        subUnit: Joi.string().optional(),
        conversionFactor: Joi.number().positive().allow(null).optional(),
      })
    )
    .required(), // Items array is now required
  branchId: Joi.string().required(),
  userId: Joi.string().optional(),
    localId: Joi.string().optional(), 
}).or("items", "isCustomAmount"); // Either items or isCustomAmount must be present

export const transactionSchema = Joi.object({
  amount: Joi.number().positive().required(),
  paymentMethod: Joi.string()
    .valid("cash", "mtn_momo", "airtel_money")
    .required(),
  customerName: Joi.string().allow("", null).optional(),
  customerPhone: Joi.string().allow("", null).optional(),
  items: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.string().required(),
        price: Joi.number().positive().required(),
        quantity: Joi.number().positive().required(),
        purchasePrice: Joi.number().positive().allow(null).optional(),
        name: Joi.string().optional(),
        productType: Joi.string().optional(),
        unit: Joi.string().allow("", null).optional(),
        subUnit: Joi.string().allow("", null).optional(),
        conversionFactor: Joi.number().positive().allow(null).optional(),
      })
    )
    .optional(),
  branchId: Joi.string().required(),
  userId: Joi.string().optional(),
  customItemName: Joi.string().allow("", null).optional(),
  isCustomAmount: Joi.boolean().optional(),
    localId: Joi.string().optional(), 
}).or("items", "isCustomAmount"); // Either items or isCustomAmount must be present

export const customerSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  phone: Joi.string().required().min(9).max(15),
  email: Joi.string().optional().email(),
  gender: Joi.string().optional().valid("Male", "Female", "Other"),
  birthday: Joi.string().optional().isoDate(),
  customerType: Joi.string()
    .valid("Regular", "VIP", "Wholesale")
    .default("Regular"),
  notes: Joi.string().optional().max(500),
  branchId: Joi.string().required(),
});

export const creditEntrySchema = Joi.object({
  customerName: Joi.string().required().min(2).max(100),
  customerPhone: Joi.string().optional().min(9).max(15),
  items: Joi.array()
    .items(
      Joi.object({
        itemId: Joi.string().required(),
        itemName: Joi.string().required(),
        quantity: Joi.number().positive().required(),
        price: Joi.number().positive().required(),
        total: Joi.number().positive().required(),
      })
    )
    .required()
    .min(1),
  totalAmount: Joi.number().positive().required(),
  dateTaken: Joi.date().required(),
  dueDate: Joi.date().optional(),
  branchId: Joi.string().required(),
  
});

export const creditPaymentSchema = Joi.object({
  creditEntryId: Joi.string().required(),
  amountPaid: Joi.number().positive().required(),
  paymentDate: Joi.date().required(),
  paymentMethod: Joi.string()
    .valid("cash", "mtn_momo", "airtel_money", "bank_transfer", "other")
    .required(),
  notes: Joi.string().optional().max(500),
  branchId: Joi.string().required(),
});

export const agroProductSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  description: Joi.string().optional().max(500),
  category: Joi.string().required().max(50),
  baseCurrency: Joi.string().default("UGX"),
  unitOfMeasure: Joi.string().required(),
  currentAverageCostPrice: Joi.number().min(0).default(0),
  totalStockQuantity: Joi.number().min(0).default(0),
  minStockLevel: Joi.number().min(0).optional(),
  productCode: Joi.string().optional(),
  isActive: Joi.boolean().default(true),
  branchId: Joi.string().uuid().required(),
  initialCostPrice: Joi.number().min(0).optional(),
  initialStockDate: Joi.date().optional(),
});

export const agroProductStockUpdateSchema = Joi.object({
  quantityChange: Joi.number().required(),
  reason: Joi.string().optional().max(255),
});

// web

// Common schemas for reuse
const baseProductSchema = {
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().max(500).allow('', null),
  category: Joi.string().required().max(50),
  baseCurrency: Joi.string().default('UGX').max(3),
  isActive: Joi.boolean().default(true),
  branchId: Joi.string().required(),
};

// Agro Product Schema
export const agroProductSchemaWeb = Joi.object({
  ...baseProductSchema,
  hasVariants: Joi.boolean().default(false),
  unitOfMeasure: Joi.when('hasVariants', {
    is: false,
    then: Joi.string().required().max(20),
    otherwise: Joi.string().max(20).allow('', null),
  }),
  minStockLevel: Joi.number().min(0).allow(null),
  productCode: Joi.string().max(50).allow('', null),
});

// Agro Product Variant Schema
export const agroProductVariantSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().max(500).allow('', null),
  unitOfMeasure: Joi.string().required().max(20),
  minStockLevel: Joi.number().min(0).allow(null),
  productCode: Joi.string().max(50).allow('', null),
  isActive: Joi.boolean().default(true),
  currentAverageCostPrice: Joi.number().min(0).default(0),
  totalStockQuantity: Joi.number().min(0).default(0),
});

// Stock Shipment Schema
export const stockShipmentWebSchema = Joi.object({
  quantity: Joi.number().required().min(0.01),
  costPrice: Joi.number().required().min(0),
  currency: Joi.string().required().max(3),
  receivedDate: Joi.date().required(),
  supplierInfo: Joi.string().max(200).allow('', null),
  type: Joi.string().valid('PURCHASE', 'ADJUSTMENT', 'INITIAL').default('PURCHASE'),
  notes: Joi.string().max(500).allow('', null),
});

export const updateStockSchema = Joi.object({
  quantityChange: Joi.number().required(),
  reason: Joi.string().max(200).required(),
});
//welding job schema
// export const weldingJobSchema = Joi.object({
//   customerName: Joi.string().required(),
//   customerContact: Joi.string().required(),
//   customerLocation: Joi.string().allow("").optional(),
//   jobType: Joi.string().required(),
//   description: Joi.string().required(),
//   estimatedCost: Joi.number().positive().required(),
//   requiredDeliveryDate: Joi.date().iso().required(),
//   status: Joi.string()
//     .valid(
//       "Pending",
//       "Quoted",
//       "Approved",
//       "In Progress",
//       "Awaiting Materials",
//       "Ready for Painting",
//       "Completed",
//       "Delivered"
//     )
//     .default("Pending"),
//   assignedArtisan: Joi.string().allow("").optional(),
//   branchId: Joi.string().required(),
// }).options({ stripUnknown: true }); // This will remove any fields not defined in the schema

export const weldingJobSchema = Joi.object({
  customerName: Joi.string().required(),
  customerContact: Joi.string().required(),
  customerLocation: Joi.string().allow("").optional(),
  jobType: Joi.string().required(),
  description: Joi.string().required(),
  materialsNeeded: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().optional(),
        name: Joi.string().required(),
        quantity: Joi.number().positive().required(),
        unit: Joi.string().required(),
        costPerUnit: Joi.number().positive().optional(),
        isCustom: Joi.boolean().default(false),
      })
    )
    .optional(),
  estimatedCost: Joi.number().positive().required(),
  requiredDeliveryDate: Joi.date().iso().required(),
  status: Joi.string()
    .valid(
      "Pending",
      "Quoted",
      "Approved",
      "In Progress",
      "Awaiting Materials",
      "Ready for Painting",
      "Completed",
      "Delivered"
    )
    .default("Pending"),
  assignedArtisans: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string()).max(5), // Allow array of artisan IDs
      Joi.string().allow("", null) // Backward compatibility for single artisan
    )
    .optional(),
  branchId: Joi.string().required(),
});

// Update schema with all fields optional (for PATCH/PUT updates)
export const weldingJobUpdateSchema = Joi.object({
  id: Joi.string().optional(), // Explicitly allow but not require
  customerName: Joi.string().optional(),
  customerContact: Joi.string().optional(),
  customerLocation: Joi.string().allow("").optional(),
  jobType: Joi.string().optional(),
  description: Joi.string().optional(),
  materialsNeeded: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().optional(),
        name: Joi.string().optional(),
        quantity: Joi.number().positive().optional(),
        unit: Joi.string().optional(),
        costPerUnit: Joi.number().positive().optional(),
        isCustom: Joi.boolean().default(false),
      })
    )
    .optional(),
  estimatedCost: Joi.number().positive().optional(),
  requiredDeliveryDate: Joi.date().iso().optional(),
  status: Joi.string()
    .valid(
      "Pending",
      "Quoted",
      "Approved",
      "In Progress",
      "Awaiting Materials",
      "Ready for Painting",
      "Completed",
      "Delivered"
    )
    .optional(),
  assignedArtisans: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string()).max(5), // Allow array of artisan IDs
      Joi.string().allow("", null) // Backward compatibility for single artisan
    )
    .optional(),

  branchId: Joi.string().optional(), // Consider if this should be modifiable
  // Add other optional fields from your interface as needed
  activeQuoteId: Joi.string().optional(),
  activeInvoiceId: Joi.string().optional(),
  imageUploads: Joi.array()
    .items(
      Joi.object({
        stage: Joi.string(),
        uri: Joi.string(),
        timestamp: Joi.string(),
      })
    )
    .optional(),
  deliveryConfirmed: Joi.boolean().optional(),
  customerRating: Joi.number().min(1).max(5).optional(),
  customerFeedback: Joi.string().optional(),
  paymentsReceived: Joi.array()
    .items(
      Joi.object({
        amount: Joi.number(),
        date: Joi.string(),
        method: Joi.string(),
      })
    )
    .optional(),
  expenses: Joi.array()
    .items(
      Joi.object({
        id: Joi.string(),
        description: Joi.string(),
        amount: Joi.number(),
        date: Joi.string(),
        weldingJobId: Joi.string().optional(),
      })
    )
    .optional(),
}).min(1);

export const weldingMaterialSchema = Joi.object({
  name: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  unit: Joi.string().required(),
  costPerUnit: Joi.number().positive().optional(),
  isCustom: Joi.boolean().default(false),
});

export const weldingMaterialStockSchema = Joi.object({
  name: Joi.string().required(),
  unit: Joi.string().required(),
  quantityInStock: Joi.number().min(0).required(),
  lowStockThreshold: Joi.number().min(0).optional(),
  supplierInfo: Joi.string().allow("").optional(),
  branchId: Joi.string().required(),
});

export const weldingExpenseSchema = Joi.object({
  description: Joi.string().required(),
  amount: Joi.number().positive().required(),
  date: Joi.date().iso().required(),
});

export const weldingImageSchema = Joi.object({
  stage: Joi.string().required(),
  uri: Joi.string().uri().required(),
  timestamp: Joi.date().iso().required(),
});

//quote schema
export const weldingQuoteSchema = Joi.object({
  customerDetails: Joi.object({
    name: Joi.string().required(),
    contact: Joi.string().required(),
    location: Joi.string().allow("").optional(),
  }).required(),
  notes: Joi.string().allow("").optional(),
  validUntil: Joi.date().iso().optional(),
});

export const weldingQuoteLineItemSchema = Joi.object({
  description: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  unitPrice: Joi.number().positive().required(),
  materialDetails: Joi.alternatives()
    .try(
      Joi.object({
        name: Joi.string().required(),
        unit: Joi.string().required(),
        isCustom: Joi.boolean().required(),
      }),
      Joi.object().pattern(Joi.string(), Joi.any()), // Allow any object structure
      Joi.allow(null) // Allow null values
    )
    .optional(),
});

export const weldingInvoiceSchema = Joi.object({
  customerDetails: Joi.object({
    name: Joi.string().required(),
    contact: Joi.string().required(),
    location: Joi.string().allow("").optional(),
  }).required(),
  issueDate: Joi.date().iso().optional(),
  dueDate: Joi.date().iso().optional(),
  notes: Joi.string().allow("").optional(),
});

export const weldingInvoiceLineItemSchema = Joi.object({
  description: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  unitPrice: Joi.number().positive().required(),
  materialDetails: Joi.object({
    name: Joi.string().required(),
    unit: Joi.string().required(),
    isCustom: Joi.boolean().required(),
  }).optional(),
});

export const weldingPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  method: Joi.string().required(),
  date: Joi.date().iso().required(),
  reference: Joi.string().allow("").optional(),
  notes: Joi.string().allow("").optional(),
});
