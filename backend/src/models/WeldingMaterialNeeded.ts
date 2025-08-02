import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { WeldingJob } from "./WeldingJob";

@Entity('welding_material_needed')
export class WeldingMaterialNeeded {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  quantity!: number;

  @Column()
  unit!: string;

  @Column("decimal", { precision: 12, scale: 2, nullable: true })
  costPerUnit?: number;

  @Column({ default: false })
  isCustom!: boolean;

  @ManyToOne(() => WeldingJob, job => job.materialsNeeded)
  weldingJob!: WeldingJob;
}