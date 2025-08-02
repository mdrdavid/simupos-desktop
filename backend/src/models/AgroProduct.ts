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
import { StockShipment } from "./StockShipment";
import { AgroProductSaleItem } from "./AgroProductSaleItem";
import { AgroProductVariant } from "./AgroProductVariant";

@Entity()
export class AgroProduct {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column()
  category!: string;

  @Column({ default: "UGX" })
  baseCurrency!: string;

  @Column()
  unitOfMeasure!: string;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  currentAverageCostPrice!: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  totalStockQuantity!: number;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  minStockLevel!: number;

  @Column({ nullable: true })
  productCode!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column()
  branchId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ default: false })
  hasVariants!: boolean; // Flag to indicate if this product has variants

  @OneToMany(() => AgroProductVariant, (variant) => variant.product)
  variants!: AgroProductVariant[];
  
  @OneToMany(() => StockShipment, (shipment) => shipment.product)
  stockShipments!: StockShipment[];

  @OneToMany(() => AgroProductSaleItem, (saleItem) => saleItem.product)
  saleItems!: AgroProductSaleItem[];

  @ManyToOne(() => Branch, (branch) => branch.agroProducts)
  branch!: Branch;

  @Column({ type: "timestamp", nullable: true })
  lastSyncAt?: Date;
  // Soft delete
  @Column({ default: false })
  isDeleted!: boolean;
}
