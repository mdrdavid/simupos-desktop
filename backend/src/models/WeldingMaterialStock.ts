import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { Branch } from "./Branch";

@Entity('welding_material_stock')
export class WeldingMaterialStock {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  unit!: string;

  @Column("decimal", { precision: 10, scale: 2 })
  quantityInStock!: number;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  lowStockThreshold?: number;

  @Column({ nullable: true })
  supplierInfo?: string;

  @Column({ nullable: true })
  lastRestockDate?: Date;

  @Column({ nullable: true, type: "text" })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column()
  branchId!: string;

  @ManyToOne(() => Branch, branch => branch.weldingMaterialStock)
  branch!: Branch;

  @Column({ type: "timestamp", nullable: true })
  lastSyncAt?: Date;

  @Column({ default: false })
  isDeleted!: boolean;
}