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
import { User } from "./User";
import { TransactionItem } from "./TransactionItem";

export type PaymentMethod = "cash" | "mtn_momo" | "airtel_money";

@Entity("transactions")
@Index(["branchId", "createdAt"])
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true, length: 6, nullable: true })
  transactionId!: string; // New 6-digit ID field

  @Column("decimal", { precision: 12, scale: 2 })
  amount!: number;

  @Column({
    type: "enum",
    enum: ["cash", "mtn_momo", "airtel_money"],
    default: "cash",
  })
  paymentMethod!: PaymentMethod;

  @Column({ nullable: true })
  @IsOptional()
  customerName?: string;

  @Column({ nullable: true })
  @IsOptional()
  customerPhone?: string;

  @OneToMany(() => TransactionItem, (item) => item.transaction, {
    cascade: false,
    onDelete: "CASCADE",
  })
  items!: TransactionItem[];

  @Column()
  timestamp!: Date;

  @Column({ default: false })
  isSynced!: boolean;

  @ManyToOne(() => Branch, (branch) => branch.transactions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "branchId" })
  branch!: Branch;

  @Column("uuid")
  branchId!: string;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: "SET NULL" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column("uuid")
  userId!: string;

  @Column({ default: false })
  isCustomAmount!: boolean;

  @Column({ nullable: true })
  customItemName?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ default: false })
  isDeleted!: boolean;

  @Column({ unique: true, nullable: true })
  localId!: string;
}
