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
import { AgroProduct } from "./AgroProduct";

@Entity()
export class AgroProductVariant {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string; // e.g., "Grade A", "Organic", "Red Beans"

  @Column({ nullable: true })
  description?: string;

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

  @ManyToOne(() => AgroProduct, (product) => product.variants)
  product!: AgroProduct;

  @OneToMany(() => StockShipment, (shipment) => shipment.variant)
  stockShipments!: StockShipment[];

  @OneToMany(() => AgroProductSaleItem, (saleItem) => saleItem.variant)
  saleItems!: AgroProductSaleItem[];

  @ManyToOne(() => Branch, (branch) => branch.agroProductVariant)
  branch!: Branch;
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
