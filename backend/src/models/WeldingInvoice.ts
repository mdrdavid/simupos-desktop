import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Branch } from "./Branch";
import { WeldingInvoiceLineItem } from "./WeldingInvoiceLineItem";
import { WeldingJob } from "./WeldingJob";
import { WeldingQuote } from "./WeldingQuote";
import { WeldingInvoicePayment } from "./WeldingInvoicePayment";

@Entity("welding_invoices")
export class WeldingInvoice {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  weldingJobId!: string;

  @Column({ nullable: true })
  quoteId?: string;

  @Column()
  invoiceNumber!: string;

  @Column("simple-json")
  customerDetails!: {
    name: string;
    contact: string;
    location?: string;
  };

  @OneToMany(() => WeldingInvoiceLineItem, (item) => item.invoice)
  lineItems!: WeldingInvoiceLineItem[];

  @Column("decimal", { precision: 12, scale: 2 })
  subTotal!: number;

  @Column("decimal", { precision: 5, scale: 2, nullable: true })
  taxRate?: number;

  @Column("decimal", { precision: 12, scale: 2, nullable: true })
  taxAmount?: number;

  @Column("decimal", { precision: 12, scale: 2 })
  totalAmount!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  amountPaid!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  balanceDue!: number;

  @Column()
  issueDate!: Date;

  @Column({ nullable: true })
  dueDate?: Date;

  @Column({ nullable: true })
  lastPaymentDate?: Date;

  @OneToMany(() => WeldingInvoicePayment, (payment) => payment.invoice)
  paymentsMade!: WeldingInvoicePayment[];

  @Column({
    type: "text",
    default: "Unpaid", //"Unpaid", "Partially Paid", "Paid", "Overdue"
  })
  paymentStatus!: string;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ default: true })
  includeTax!: boolean;
  
  @Column()
  branchId!: string;

  @ManyToOne(() => Branch, (branch) => branch.weldingInvoices)
  branch!: Branch;

  @ManyToOne(() => WeldingQuote, (quote) => quote.invoices)
  quote?: WeldingQuote;

  @ManyToOne(() => WeldingJob, (job) => job.invoices)
  weldingJob!: WeldingJob;

  @Column({ type: "datetime", nullable: true })
  lastSyncAt?: Date;

  @Column({ default: false })
  isDeleted!: boolean;
}
