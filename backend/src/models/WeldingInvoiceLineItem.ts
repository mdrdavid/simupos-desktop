import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { WeldingInvoice } from "./WeldingInvoice";

@Entity('welding_invoice_line_items')
export class WeldingInvoiceLineItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  description!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  quantity!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  unitPrice!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  total!: number;

  @Column("simple-json", { nullable: true })
  materialDetails?: {
    name: string;
    unit: string;
    isCustom: boolean;
  };

  @ManyToOne(() => WeldingInvoice, invoice => invoice.lineItems)
  invoice!: WeldingInvoice;
}