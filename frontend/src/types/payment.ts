import { Artisan, Assignment } from "./welding";
import { WeldingJob } from "./weldingJob";

export enum PaymentMethod {
  CASH = "cash",
  MOBILE_MONEY = "mobile_money",
  BANK_TRANSFER = "bank_transfer",
}

export interface Payment {
  id: string;
  assignmentId: string;
  jobId: string;
  artisanId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  authorizedById: string;
  paymentDate: string; // ISO date string
  voucherNumber: string;

  // Relations from backend
  job: WeldingJob;
  artisan: Artisan;
  authorizedBy: Artisan; // Assuming authorizedBy has the same shape as Artisan
  assignment: Assignment;
}

export interface PaymentVoucher {
  voucherNumber: string;
  artisanName: string;
  artisanId: string;
  jobId: string;
  jobDescription: string;
  wageAmount: number;
  amountPaidThisVoucher: number; // Renamed from amountPaid
  totalAmountPaid: number; // Added to show total
  balanceRemaining: number;
  paymentDate: string; // ISO date string
  authorizedBy: string; // User's name or ID
}
