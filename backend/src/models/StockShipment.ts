import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { AgroProduct } from "./AgroProduct";
import { AgroProductVariant } from "./AgroProductVariant";

@Entity()
export class StockShipment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  costPrice!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  quantity!: number;

  @Column()
  currency!: string;

  @Column()
  receivedDate!: Date;

  @Column({ nullable: true })
  supplierInfo!: string;

  @Column()
  branchId!: string;

  @Column({ nullable: true })
  type!: string; // 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'PURCHASE' etc.

  @Column({ nullable: true })
  notes!: string;

  @Column({ nullable: true })
  userId!: string; // User who recorded the shipment

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => AgroProduct, (product) => product.stockShipments, {
    nullable: true,
  })
  product!: AgroProduct | null;

  @ManyToOne(() => AgroProductVariant, (variant) => variant.stockShipments, {
    nullable: true,
  })
  variant!: AgroProductVariant | null;

  // @ManyToOne(() => AgroProduct, (product) => product.stockShipments)
  // product!: AgroProduct;

  // @ManyToOne(() => AgroProductVariant, (variant) => variant.stockShipments, {
  //   nullable: true,
  // })
  // variant!: AgroProductVariant | null;
}
