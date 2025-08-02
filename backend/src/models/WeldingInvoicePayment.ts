import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { WeldingInvoice } from "./WeldingInvoice";
// enums/PaymentMethod.ts
export enum PaymentMethod {
  Cash = "Cash",
  MTNMoMo = "MTN MoMo",
  AirtelMoney = "Airtel Money",
  BankTransfer = "Bank Transfer",
  CreditCard = "Credit Card",
  Check = "Check",
  Other = "Other",
}
// enums/PaymentStatus.ts
export enum PaymentStatus {
  Unpaid = "Unpaid",
  PartiallyPaid = "Partially Paid",
  Paid = "Paid",
  Overdue = "Overdue",
}
@Entity("welding_invoice_payments")
export class WeldingInvoicePayment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("decimal", { precision: 12, scale: 2 })
  amount!: number;

  @Column({
    type: "enum",
    enum: PaymentMethod,
    default: PaymentMethod.Cash,
  })
  method!: PaymentMethod;

  @Column()
  date!: Date;

  @Column({ nullable: true })
  reference?: string;

  @Column({ nullable: true })
  notes?: string;

  @Column({ nullable: true })
  recordedBy!: string; // User ID who recorded the payment

  @Column({ nullable: true })
  branchId!: string;
  // Critical relationship definition
  @ManyToOne(() => WeldingInvoice, (invoice) => invoice.paymentsMade, {
    onDelete: "CASCADE", // Ensures payments are deleted if invoice is deleted
    nullable: false, // Makes invoiceId required
  })
  @JoinColumn({ name: "invoiceId" }) // Explicitly defines the foreign key
  invoice!: WeldingInvoice;

  @Column({ nullable: false }) // Explicit column definition
  invoiceId!: string; // Must match the type of WeldingInvoice.id
  //   @ManyToOne(() => WeldingInvoice, (invoice) => invoice.paymentsMade)
  //   invoice!: WeldingInvoice;
}
