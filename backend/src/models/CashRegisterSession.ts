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
import { User } from "./User";
import { Branch } from "./Branch";
import { CashRegisterLog } from "./CashRegisterLog";

export enum CashRegisterStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

@Entity("cash_register_sessions")
export class CashRegisterSession {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @Column({ name: "branch_id" })
  branchId!: string;

  @Column({ name: "opened_at", type:  "datetime", })
  openedAt!: Date;

  @Column({ name: "closed_at", type:  "datetime", nullable: true })
  closedAt?: Date;

  @Column({ name: "opening_float", type: "decimal", precision: 15, scale: 2 })
  openingFloat!: number;

  @Column({
    name: "total_cash_sales",
    type: "decimal",
    precision: 15,
    scale: 2,
    default: 0,
  })
  totalCashSales!: number;

  @Column({
    name: "cash_in",
    type: "decimal",
    precision: 15,
    scale: 2,
    default: 0,
  })
  cashIn!: number;

  @Column({
    name: "cash_out",
    type: "decimal",
    precision: 15,
    scale: 2,
    default: 0,
  })
  cashOut!: number;

  @Column({
    name: "closing_balance",
    type: "decimal",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  closingBalance?: number;

  @Column({
    name: "expected_balance",
    type: "decimal",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  expectedBalance?: number;

  @Column({
    name: "discrepancy",
    type: "decimal",
    precision: 15,
    scale: 2,
    nullable: true,
  })
  discrepancy?: number;

  @Column({ type: "text", nullable: true })
  notes?: string;

  @Column({
    type: "text",
    default: CashRegisterStatus.OPEN,
  })
  status!: CashRegisterStatus;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: "branch_id" })
  branch!: Branch;

  @OneToMany(() => CashRegisterLog, (log) => log.session)
  logs!: CashRegisterLog[];

  // Computed properties
  get expectedCash(): number {
    return (
      Number(this.openingFloat) +
      Number(this.totalCashSales) +
      Number(this.cashIn) -
      Number(this.cashOut)
    );
  }

  get actualDiscrepancy(): number {
    if (this.closingBalance === null || this.closingBalance === undefined)
      return 0;
    return Number(this.closingBalance) - this.expectedCash;
  }
}
