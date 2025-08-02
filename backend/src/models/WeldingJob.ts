import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Branch } from "./Branch";
import { WeldingMaterialNeeded } from "./WeldingMaterialNeeded";
import { WeldingJobExpense } from "./WeldingJobExpense";
import { WeldingJobImage } from "./WeldingJobImage";
import { WeldingInvoice } from "./WeldingInvoice";
import { WeldingQuote } from "./WeldingQuote";

@Entity("welding_jobs")
export class WeldingJob {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  customerName!: string;

  @Column()
  customerContact!: string;

  @Column({ nullable: true })
  customerLocation?: string;

  @Column()
  jobType!: string;

  @Column("text")
  description!: string;

  @Column("decimal", { precision: 12, scale: 2 })
  estimatedCost!: number;

  @Column()
  requiredDeliveryDate!: Date;

  @Column({
    type: "enum",
    enum: [
      "Pending",
      "Quoted",
      "Approved",
      "In Progress",
      "Awaiting Materials",
      "Ready for Painting",
      "Completed",
      "Delivered",
    ],
    default: "Pending",
  })
  status!: string;

  @Column({ nullable: true })
  activeQuoteId?: string;

  @Column({ nullable: true })
  activeInvoiceId?: string;

  @Column("text", { array: true, nullable: true })
    assignedArtisans?: string[];

  @Column({ nullable: true, type: "boolean" })
  deliveryConfirmed?: boolean;

  @Column({ nullable: true, type: "smallint" })
  customerRating?: number;

  @Column({ nullable: true, type: "text" })
  customerFeedback?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  branchId!: string;

  @OneToMany(() => WeldingMaterialNeeded, (material) => material.weldingJob)
  materialsNeeded!: WeldingMaterialNeeded[];

  @OneToMany(() => WeldingJobExpense, (expense) => expense.weldingJob)
  expenses!: WeldingJobExpense[];

  @OneToMany(() => WeldingJobImage, (image) => image.weldingJob)
  imageUploads!: WeldingJobImage[];

  @ManyToOne(() => Branch, (branch) => branch.weldingJobs)
  branch!: Branch;

  @OneToMany(() => WeldingInvoice, (invoices) => invoices.weldingJob)
  invoices!: WeldingInvoice[];

  @OneToMany(() => WeldingQuote, (quotes) => quotes.weldingJob)
  quotes!: WeldingQuote[];

  @Column({ type: "timestamp", nullable: true })
  lastSyncAt?: Date;

  @Column({ default: false })
  isDeleted!: boolean;
}
