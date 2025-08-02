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
import { User } from "./User";
import { IsIn, IsNumber, IsOptional, Min } from "class-validator";
export enum PaymentMethod {
  CASH = "cash",
  BANK = "bank",
  MOBILE_MONEY = "mobile_money",
}
@Entity("expenses")
export class Expense {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("decimal", { precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @Column({ nullable: true })
  @IsOptional()
  category!: string;

  @Column({ nullable: true })
  @IsOptional()
  description?: string;

  @Column()
  date!: Date;

  @Column({
    type: "text",
    default: PaymentMethod.CASH,
  })
  paymentMethod!: PaymentMethod;

  @Column({ nullable: true })
  @IsOptional()
  receiptNumber?: string;

  @Column({ nullable: true })
  @IsOptional()
  vendor?: string;

  @Column({ default: false })
  isRecurring!: boolean;

  @Column({ default: false })
  isDeleted!: boolean;

  // Relations
  @ManyToOne(() => Branch, (branch) => branch.expenses, { onDelete: "CASCADE" })
  @JoinColumn({ name: "branchId" })
  branch!: Branch;

  @Column("uuid")
  branchId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column("uuid")
  userId!: string;

  // Timestamps
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
