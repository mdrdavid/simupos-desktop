import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { WeldingQuote } from "./WeldingQuote";

@Entity("welding_quote_line_items")
export class WeldingQuoteLineItem {
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

  @ManyToOne(() => WeldingQuote, (quote) => quote.lineItems)
  quote!: WeldingQuote;
}
