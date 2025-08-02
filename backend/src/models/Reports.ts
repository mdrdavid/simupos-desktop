import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Business } from "./Business";
import { Branch } from "./Branch";

export enum ReportType {
  SALES = "sales",
  INVENTORY = "inventory",
  PROFIT = "profit",
  EXPENSE = "expense",
  CUSTOM = "custom",
}

@Entity("reports")
export class Report {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

 @Column({
  type: "text",
  default: ReportType.SALES,
})
type!: ReportType;


  @Column("jsonb")
  filters!: Record<string, any>;

  @Column("jsonb")
  data!: Record<string, any>;

  @ManyToOne(() => Business)
  @JoinColumn({ name: "businessId" })
  business!: Business;

  @Column("uuid")
  businessId!: string;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: "branchId" })
  branch?: Branch;

  @Column("uuid", { nullable: true })
  branchId?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdById" })
  createdBy!: User;

  @Column("uuid")
  createdById!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ default: false })
  isDeleted!: boolean;
}
