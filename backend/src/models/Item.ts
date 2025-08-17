import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { IsNotEmpty, IsOptional, IsNumber, Min } from "class-validator";
import { Branch } from "./Branch";
import { SaleItem } from "./SaleItem";
import { StockMovement } from "./StockMovement";
export enum ProductType {
  RETAIL = "retail",
  SERVICE = "service",
  PROCESSED = "processed",
  RAW_MATERIAL = "raw_material",
  COMBO = "combo",
}
@Entity("items")
@Index(["name", "branchId"])
@Index(["barcode", "branchId"], { unique: true })
export class Item {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  @IsNotEmpty()
  name!: string;

  @Column({ nullable: true })
  @IsOptional()
  description?: string;

  @Column({ nullable: true, unique: true })
  @IsOptional()
  barcode?: string;

  @Column({ nullable: true })
  @IsOptional()
  category?: string;

  @Column("decimal", { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  sellingPrice!: number;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @Column("int", { default: 0 })
  @IsNumber()
  @Min(0)
  stockQuantity!: number;

  @Column("int", { default: 0 })
  @IsNumber()
  @Min(0)
  minStockLevel!: number;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  costPrice?: number;

  @Column("uuid")
  branchId!: string;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    nullable: true,
    name: "profit_per_unit",
  })
  profitPerUnit?: number;

  @Column("decimal", {
    precision: 5,
    scale: 2,
    nullable: true,
    name: "profit_margin",
  })
  profitMargin?: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({
    type: "text",
    default: ProductType.RETAIL,
  })
  productType!: ProductType;

  @Column({ nullable: true })
  @IsOptional()
  unit?: string;

  @Column({ nullable: true })
  subUnit?: string;

  @Column({ nullable: true })
  @IsOptional()
  image?: string;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    nullable: true,
  })
  conversionFactor?: number;

  @Column("simple-json", { nullable: true })
  rawMaterials?: { itemId: string; quantityNeeded: number }[];

  @Column({ type: "simple-json", nullable: true })
  metadata?: Record<string, any>;
  // Relations
  @ManyToOne(() => Branch, (branch) => branch.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "branchId" })
  branch!: Branch;

  @OneToMany(() => StockMovement, (movement) => movement.item, {
    onDelete: "CASCADE",
  })
  stockMovements!: StockMovement[];

  @OneToMany(() => SaleItem, (saleItem) => saleItem.item, {
    onDelete: "CASCADE",
  })
  saleItems!: SaleItem[];

  @Column({ nullable: true })
  @IsOptional()
  createdBy?: string;

  @Column({ nullable: true })
  @IsOptional()
  updatedBy?: string;
  // Timestamps
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: "datetime", nullable: true })
  lastSyncAt?: Date;
  // Soft delete
  @Column({ default: false })
  isDeleted!: boolean;
}
