
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Branch } from "./Branch";
import { User } from "./User";
import { CreditPayment } from "./CreditPayment";

export type CreditStatus = "unpaid" | "partially_paid" | "paid";

@Entity("credit_entries")
export class CreditEntry {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  customerName!: string;

  @Column({ nullable: true })
  customerPhone?: string;

  @Column("jsonb")
  items!: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    price: number;
    total: number;
  }>;

  @Column("decimal", { precision: 12, scale: 2 })
  totalAmount!: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  amountPaid!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  balance!: number;

  @Column("date")
  dateTaken!: Date;

  @Column("date", { nullable: true })
  dueDate?: Date;

  @Column({
    type: "enum",
    enum: ["unpaid", "partially_paid", "paid"],
    default: "unpaid",
  })
  status!: CreditStatus;

  // Relations
  @ManyToOne(() => Branch, (branch) => branch.creditEntries, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "branchId" })
  branch!: Branch;

  @Column("uuid")
  branchId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column("uuid")
  userId!: string;

  @OneToMany(() => CreditPayment, (payment) => payment.creditEntry)
  payments!: CreditPayment[];

  // Timestamps
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}