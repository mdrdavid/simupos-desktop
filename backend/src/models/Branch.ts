import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  ManyToOne,
} from "typeorm";
import { IsNotEmpty, IsOptional, IsEmail, IsBoolean } from "class-validator";
import { User } from "./User";
import { Item } from "./Item";
import { Sale } from "./Sale";
import { Expense } from "./Expense";
import { Business } from "./Business";
import { Transaction } from "./Transaction";
import { CreditEntry } from "./CreditEntry";
import { Customer } from "./Customer";
import { CreditPayment } from "./CreditPayment";
import { AgroProduct } from "./AgroProduct";
import { AgroSale } from "./AgroSale";
import { WeldingJob } from "./WeldingJob";
import { WeldingMaterialStock } from "./WeldingMaterialStock";
import { WeldingInvoice } from "./WeldingInvoice";
import { WeldingQuote } from "./WeldingQuote";
import { AgroProductVariant } from "./AgroProductVariant";

@Entity("branches")
@Index(["name"])
export class Branch {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  @IsNotEmpty()
  name!: string;

  @Column({ nullable: true })
  @IsOptional()
  address?: string;

  @Column({ nullable: true })
  @IsOptional()
  phone?: string;

  @Column({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Column({ nullable: true })
  @IsOptional()
  manager?: string;

  @Column({ default: true })
  @IsBoolean()
  isActive!: boolean;

  @Column({ default: false })
  @IsBoolean()
  isMain!: boolean;

  @Column({ type: "jsonb", nullable: true })
  settings?: Record<string, any>;

  @ManyToOne(() => Business, (business) => business.branches, {
    onDelete: "CASCADE",
  })
  business!: Business;

  @OneToMany(() => User, (user) => user.branch)
  users!: User[];

  @OneToMany(() => Item, (item) => item.branch)
  items!: Item[];

  @OneToMany(() => Sale, (sale) => sale.branch)
  sales!: Sale[];

  @OneToMany(() => Expense, (expense) => expense.branch)
  expenses!: Expense[];

  @OneToMany(() => Transaction, (transaction) => transaction.branch)
  transactions!: Transaction[];

  @OneToMany(() => CreditEntry, (creditEntries) => creditEntries.branch)
  creditEntries!: CreditEntry[];

  @OneToMany(() => Customer, (customers) => customers.branch)
  customers!: Customer[];

  @OneToMany(() => AgroProduct, (agroProducts) => agroProducts.branch)
  agroProducts!: AgroProduct[];

  @OneToMany(
    () => AgroProductVariant,
    (agroProductVariant) => agroProductVariant.branch
  )
  agroProductVariant!: AgroProductVariant[];

  @OneToMany(() => AgroSale, (agroSales) => agroSales.branch)
  agroSales!: AgroSale[];

  @OneToMany(() => WeldingJob, (weldingJobs) => weldingJobs.branch)
  weldingJobs!: WeldingJob[];

  @OneToMany(() => WeldingInvoice, (weldingInvoices) => weldingInvoices.branch)
  weldingInvoices!: WeldingInvoice[];

  @OneToMany(() => WeldingQuote, (weldingQuotes) => weldingQuotes.branch)
  weldingQuotes!: WeldingQuote[];

  @OneToMany(
    () => WeldingMaterialStock,
    (weldingMaterialStock) => weldingMaterialStock.branch
  )
  weldingMaterialStock!: WeldingMaterialStock[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  lastSyncAt?: Date;

  @Column({ default: false })
  isDeleted!: boolean;
}
