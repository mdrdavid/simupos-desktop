import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Branch } from "./Branch";
import { IsOptional } from "class-validator";
export enum CustomerType {
  REGULAR = "Regular",
  VIP = "VIP",
  WHOLESALE = "Wholesale",
}
@Entity("customers")
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  phone!: string;

  @Column({ nullable: true })
  @IsOptional()
  email?: string;

  @Column({ nullable: true })
  @IsOptional()
  gender?: string;

  @Column({ type: "date", nullable: true })
  @IsOptional()
  birthday?: Date;

  @Column({
    type: "text",
    default: CustomerType.REGULAR,
  })
  customerType!: CustomerType;
  @Column({ type: "text", nullable: true })
  @IsOptional()
  notes?: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  totalSpend!: number;

  @Column({ nullable: true })
  @IsOptional()
  lastVisit?: Date;

  @Column({ type: "int", default: 0 })
  loyaltyPoints!: number;

  // Relations
  @ManyToOne(() => Branch, (branch) => branch.customers, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "branchId" })
  branch!: Branch;

  @Column("uuid")
  branchId!: string;

  // Timestamps
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Soft delete
  @Column({ default: false })
  isDeleted!: boolean;
}
