import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { CashRegisterSession } from "./CashRegisterSession";
import { User } from "./User";

export enum CashRegisterLogType {
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
  SALE = "SALE",
  OPENING_FLOAT = "OPENING_FLOAT",
  CLOSING_BALANCE = "CLOSING_BALANCE",
}

@Entity("cash_register_logs")
export class CashRegisterLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "session_id" })
  sessionId!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @Column({
    type: "text",
  })
  type!: CashRegisterLogType;

  @Column({ type: "decimal", precision: 15, scale: 2 })
  amount!: number;

  @Column({ type: "text", nullable: true })
  reason?: string;

  @Column({ name: "reference_id", nullable: true })
  referenceId?: string; // Transaction ID for sales

  @Column({ type: "json", nullable: true })
  metadata?: any; // Additional data like transaction details

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  // Relations
  @ManyToOne(() => CashRegisterSession, (session) => session.logs)
  @JoinColumn({ name: "session_id" })
  session!: CashRegisterSession;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;
}
