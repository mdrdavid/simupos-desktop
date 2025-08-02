import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { CreditEntry } from "./CreditEntry";
import { User } from "./User";
import { Branch } from "./Branch";

export type PaymentMethod =
  | "cash"
  | "mtn_momo"
  | "airtel_money"
  | "bank_transfer"
  | "other";

@Entity("credit_payments")
export class CreditPayment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => CreditEntry, (entry) => entry.payments, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "creditEntryId" })
  creditEntry!: CreditEntry;

  @Column("decimal", { precision: 12, scale: 2 })
  amountPaid!: number;

  @Column("date")
  paymentDate!: Date;

  @Column({
    type: "enum",
    enum: ["cash", "mtn_momo", "airtel_money", "bank_transfer", "other"],
    default: "cash",
  })
  paymentMethod!: PaymentMethod;

  @Column({ nullable: true })
  notes?: string;

  // Relations
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column("uuid")
  userId!: string;

  @ManyToOne(() => Branch, { onDelete: "CASCADE" })
  @JoinColumn({ name: "branchId" })
  branch!: Branch;

  @Column("uuid")
  branchId!: string;

  // Timestamps
  @CreateDateColumn()
  createdAt!: Date;
}
