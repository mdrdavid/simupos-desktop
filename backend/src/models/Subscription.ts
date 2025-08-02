import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { IsNumber, Min, IsEnum } from "class-validator";
import { User } from "./User";
import { SubscriptionPlan } from "./SubscriptionPlan";

export enum SubscriptionStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  PENDING = "pending",
}

@Entity("subscriptions")
// @Index(["userId", "status"])
@Index(["userId", "subscriptionStatus"])
export class Subscription {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => SubscriptionPlan, { onDelete: "CASCADE" })
  @JoinColumn({ name: "planId" })
  plan!: SubscriptionPlan;

  @Column("uuid")
  planId!: string;
@Column({
  type: "text",
  default: SubscriptionStatus.ACTIVE,
})
status!: SubscriptionStatus;

  @Column("decimal", { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  amount!: number;

  @Column({ type: "date" })
  startDate!: Date;

  @Column({ type: "date" })
  endDate!: Date;

  @Column({ type: "varchar", nullable: true })
  paymentMethod?: "cash" | "mtn_momo" | "airtel_money";

  @Column({ default: false })
  autoRenew!: boolean;

  @Column({ type: "jsonb", nullable: true })
  features?: Record<string, any>;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column("uuid", { nullable: true })
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  lastSyncAt?: Date;

  @Column({ default: false })
  isDeleted!: boolean;

  @Column({ default: false })
  isTrial!: boolean;

  @Column({ nullable: true })
  trialEndDate?: Date;

  @Column({ type: "timestamp", nullable: true })
  cancelledAt?: Date | null;

  @Column({ type: "timestamp", nullable: true })
  expiredAt?: Date | null;
}
