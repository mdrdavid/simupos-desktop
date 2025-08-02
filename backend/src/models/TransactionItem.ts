import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Transaction } from "./Transaction";
import { Item } from "./Item";
import { AgroProduct } from "./AgroProduct";

@Entity("transaction_items")
export class TransactionItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price!: number;

  @Column("int")
  quantity!: number;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  purchasePrice?: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  productType?: string;

  @Column({ nullable: true })
  unit?: string;

  @Column({ nullable: true })
  subUnit?: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  conversionFactor?: number;

  // Indicates whether this is an agro product or regular item
  @Column({ default: false })
  isAgroProduct!: boolean;

  @ManyToOne(() => Transaction, (transaction) => transaction.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "transactionId" })
  transaction!: Transaction;

  @Column("uuid")
  transactionId!: string;

  // Regular item reference (nullable)
  @ManyToOne(() => Item, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "itemId" })
  item?: Item;

  @Column("uuid", { nullable: true })
  itemId?: string;

  // Agro product reference (nullable)
  @ManyToOne(() => AgroProduct, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "agroProductId" })
  agroProduct?: AgroProduct;

  @Column("uuid", { nullable: true })
  agroProductId?: string;

  @Column({ default: false })
  isDeleted!: boolean;
}
