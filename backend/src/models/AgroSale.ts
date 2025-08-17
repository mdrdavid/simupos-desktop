import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Branch } from "./Branch";
import { AgroProductSaleItem } from "./AgroProductSaleItem";
import { AgroCustomerDetails } from "./AgroCustomerDetails";
export enum AgroPaymentMethod {
  CASH = "cash",
  MOBILE_MONEY = "mobile_money",
  BANK_TRANSFER = "bank_transfer",
  OTHER = "other",
}
@Entity()
export class AgroSale {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  saleDate!: Date;

  @Column("decimal", { precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ default: "UGX" })
  currency!: string;

  @Column({ default: false })
  isCreditSale!: boolean;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  amountPaid!: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  balanceDue!: number;

  @Column({ default: false })
  isDeliveryPending!: boolean;

  @Column({ nullable: true })
  deliveryDate?: Date;

  @Column({ nullable: true })
  deliveryAddress?: string;

  @Column("simple-json", { nullable: true })
  customerDetails?: AgroCustomerDetails;

  @Column({
    type: "text",
    nullable: true,
  })
  paymentMethod?: AgroPaymentMethod;

  @Column({ nullable: true })
  notes?: string;

  @Column()
  branchId!: string;

  @Column()
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => AgroProductSaleItem, (item) => item.sale, { cascade: true })
  items!: AgroProductSaleItem[];

  @ManyToOne(() => Branch, (branch) => branch.agroSales)
  @JoinColumn({ name: "branchId" })
  branch!: Branch;
}
