import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AgroProduct } from "./AgroProduct";
import { AgroSale } from "./AgroSale";
import { AgroProductVariant } from "./AgroProductVariant";

@Entity()
export class AgroProductSaleItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid")
  productId!: string; // Reference to the AgroProduct

  @Column()
  productName!: string; // Cached product name at time of sale

  @Column("decimal", { precision: 10, scale: 2 })
  quantity!: number;

  @Column()
  unitOfMeasure!: string; // Cached UoM at time of sale

  @Column("decimal", { precision: 10, scale: 2 })
  unitPrice!: number; // Price per unit at time of sale

  @Column("decimal", { precision: 10, scale: 2 })
  totalPrice!: number; // quantity * unitPrice

  @Column({ nullable: true })
  batchNumber?: string; // For tracking specific batches if needed

  @Column({ nullable: true })
  expiryDate?: Date; // For perishable products

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  discount?: number; // Discount amount applied to this item

  @Column({ nullable: true })
  discountReason?: string;

  // Relationships
  @ManyToOne(() => AgroSale, (sale) => sale.items)
  @JoinColumn({ name: "saleId" })
  sale!: AgroSale;

  @ManyToOne(() => AgroProductVariant, (variant) => variant.saleItems)
  @JoinColumn({ name: "agroProductVariantId" })
  variant!: AgroProductVariant;

  @ManyToOne(() => AgroProduct)
  @JoinColumn({ name: "productId" })
  product!: AgroProduct;
}
