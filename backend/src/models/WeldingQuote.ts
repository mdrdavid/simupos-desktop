import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { Branch } from "./Branch";
import { WeldingQuoteLineItem } from "./WeldingQuoteLineItem";
import { WeldingJob } from "./WeldingJob";
import { WeldingInvoice } from "./WeldingInvoice";

@Entity('welding_quotes')
export class WeldingQuote {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  weldingJobId!: string;

  @Column()
  quoteNumber!: string;

  @Column("simple-json")
  customerDetails!: {
    name: string;
    contact: string;
    location?: string;
  };

  @OneToMany(() => WeldingQuoteLineItem, item => item.quote)
  lineItems!: WeldingQuoteLineItem[];

  @Column("decimal", { precision: 12, scale: 2 })
  subTotal!: number;

  @Column("decimal", { precision: 5, scale: 2, nullable: true })
  taxRate?: number;

  @Column("decimal", { precision: 12, scale: 2, nullable: true })
  taxAmount?: number;

  @Column("decimal", { precision: 12, scale: 2 })
  totalAmount!: number;

  @Column({ nullable: true })
  validUntil?: Date;

  @Column({ nullable: true })
  notes?: string;

  @Column({
    type: "enum",
    enum: ["Draft", "Sent", "Accepted", "Declined", "Invoiced"],
    default: "Draft"
  })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  branchId!: string;

  @ManyToOne(() => Branch, branch => branch.weldingQuotes)
  branch!: Branch;

  @OneToMany(() => WeldingInvoice, invoice => invoice.quote)
  invoices!: WeldingInvoice[];

  @ManyToOne(() => WeldingJob, job => job.quotes)
  weldingJob!: WeldingJob;

  @Column({ type: "timestamp", nullable: true })
  lastSyncAt?: Date;

  @Column({ default: false })
  isDeleted!: boolean;
}