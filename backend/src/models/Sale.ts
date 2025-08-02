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
import { IsNotEmpty, IsOptional, IsNumber, Min, IsEnum } from "class-validator";
import { User } from "./User";
import { Branch } from "./Branch";
import { SaleItem } from "./SaleItem";

export enum SaleStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  CASH = "cash",
  CARD = "card",
  MOBILE = "mobile",
  BANK_TRANSFER = "bank_transfer",
}

@Entity("sales")
@Index(["saleNumber"], { unique: true })
@Index(["branchId", "createdAt"])
export class Sale {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  @IsNotEmpty()
  saleNumber!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  subtotal!: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  tax!: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  discount!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  total!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  amountPaid!: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  @IsNumber()
  change!: number;

  @Column({
    type: "enum",
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @Column({
    type: "enum",
    enum: SaleStatus,
    default: SaleStatus.COMPLETED,
  })
  @IsEnum(SaleStatus)
  status!: SaleStatus;

  @Column({ nullable: true })
  @IsOptional()
  customerName?: string;

  @Column({ nullable: true })
  @IsOptional()
  customerPhone?: string;

  @Column({ nullable: true })
  @IsOptional()
  notes?: string;

  @ManyToOne(() => User, (user) => user.sales)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column("uuid")
  userId!: string;

  @ManyToOne(() => Branch, (branch) => branch.sales)
  @JoinColumn({ name: "branchId" })
  branch!: Branch;

  @Column("uuid")
  branchId!: string;

  @OneToMany(() => SaleItem, (saleItem) => saleItem.sale, { cascade: true })
  items!: SaleItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  lastSyncAt?: Date;

  @Column({ default: false })
  isDeleted!: boolean;
}
