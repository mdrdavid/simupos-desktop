import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { WeldingJob } from "./WeldingJob";

@Entity('welding_job_expenses')
export class WeldingJobExpense {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  description!: string;

  @Column("decimal", { precision: 12, scale: 2 })
  amount!: number;

  @Column()
  date!: Date;

  @ManyToOne(() => WeldingJob, job => job.expenses)
  weldingJob!: WeldingJob;
}