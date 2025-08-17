import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { IsNumber, Min, IsBoolean, IsArray } from "class-validator";
export enum DurationUnit {
  DAYS = "days",
  MONTHS = "months",
  YEARS = "years"
}
@Entity("subscription_plans")
export class SubscriptionPlan {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  code!: string;

  @Column("text")
  description!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  price!: number;

  @Column("int")
  maxUsers!: number;

  @Column("int")
  maxTransactions!: number; // 0 = unlimited

  @Column("simple-json")
  @IsArray()
  features!: string[];

  @Column({ default: false })
  @IsBoolean()
  isPopular!: boolean;

  @Column({ default: true })
  @IsBoolean()
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  durationDays!: number;

  @Column({ default: false })
  isTrial!: boolean;

   @Column({
    type: "text",
    default: DurationUnit.MONTHS,
  })
  durationUnit!: DurationUnit;
}
