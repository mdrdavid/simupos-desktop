import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { IsNumber, Min } from "class-validator";
import { Sale } from "./Sale";
import { Item } from "./Item";

@Entity("sale_items")
@Index(["saleId", "itemId"])
export class SaleItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("int")
  @IsNumber()
  @Min(1)
  quantity!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @Column("decimal", { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  total!: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  discount!: number;

  @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "saleId" })
  sale!: Sale;

  @Column("uuid")
  saleId!: string;

  @ManyToOne(() => Item, (item) => item.saleItems)
  @JoinColumn({ name: "itemId" })
  item!: Item;

  @Column("uuid")
  itemId!: string;

  // Virtual field for profit calculation
  get profit(): number {
    if (!this.unitCost) return 0;
    return (this.unitPrice - this.unitCost) * this.quantity;
  }
}
