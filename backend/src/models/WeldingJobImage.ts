import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { WeldingJob } from "./WeldingJob";

@Entity('welding_job_images')
export class WeldingJobImage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  stage!: string;

  @Column()
  uri!: string;

  @Column()
  timestamp!: Date;

  @ManyToOne(() => WeldingJob, job => job.imageUploads)
  weldingJob!: WeldingJob;
}