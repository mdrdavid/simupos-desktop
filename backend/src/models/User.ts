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
import { IsEmail, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { Branch } from "./Branch";
import { Sale } from "./Sale";
import { Expense } from "./Expense";
import { Business } from "./Business";
import { Transaction } from "./Transaction";
import { Subscription } from "./Subscription";

export enum UserRole {
  ACCOUNTANT = "accountant",
  ADMIN = "admin",
  ARTISAN = "artisan",
  CASHIER = "cashier",
  INVENTORY_MANAGER = "inventory_manager",
  MANAGER = "manager",
  OWNER = "owner",
  SALES_REP = "sales_rep",
}


export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

@Entity("users")
@Index(["email"], { unique: true })
@Index(["phone"], { unique: true })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  @IsNotEmpty()
  firstName!: string;

  @Column()
  @IsNotEmpty()
  lastName!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column({ unique: true })
  @IsNotEmpty()
  phone!: string;

  @Column()
  passwordHash!: string;

  @Column({ nullable: true })
  @IsOptional()
  pinHash?: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.CASHIER,
  })
  @IsEnum(UserRole)
  role!: UserRole;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus)
  status!: UserStatus;

  @Column({ nullable: true })
  @IsOptional()
  profilePicture?: string;

  @Column({ nullable: true })
  @IsOptional()
  address?: string;

  @Column({ type: "jsonb", nullable: true })
  preferences?: Record<string, any>;

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  emailVerifiedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  phoneVerifiedAt?: Date;

  @OneToMany(() => Business, (business) => business.owner)
  ownedBusinesses!: Business[];

  @ManyToOne(() => Branch, (branch) => branch.users, { onDelete: "SET NULL" })
  @JoinColumn({ name: "branchId" })
  branch!: Branch;

  @Column("uuid", { nullable: true })
  branchId!: string;

  @OneToMany(() => Sale, (sale) => sale.user)
  sales!: Sale[];

  @OneToMany(() => Expense, (expense) => expense.user)
  expenses!: Expense[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions!: Transaction[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  lastSyncAt?: Date;

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions!: Subscription[];

  @Column({ type: "uuid", nullable: true })
  lastSubscriptionId?: string;

  @Column({ nullable: true })
  otpCode?: string;

  @Column({ type: "timestamp", nullable: true })
  otpExpiresAt?: Date | undefined;

  @Column({ default: false })
  isDeleted!: boolean;
  @Column({ default: false })
  isActive!: boolean;

  @Column({ type: "timestamp", nullable: true })
  lastLogoutAt?: Date | undefined;

  // createdBy as a JSONB column
  // @Column({ type: "jsonb", nullable: true })
  // createdBy?: {
  //   id: string;
  //   name: string;
  // };

  @ManyToOne(() => User, (user) => user.createdUsers, { nullable: true })
  @JoinColumn({ name: "createdById" })
  createdBy?: User;

  @OneToMany(() => User, (user) => user.createdBy)
  createdUsers?: User[];

  @Column({ type: "uuid", nullable: true })
  createdById?: string;
}
