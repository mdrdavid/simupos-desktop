import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { IsNotEmpty, IsOptional, IsEmail, IsBoolean } from "class-validator";
import { Branch } from "./Branch";
import { User } from "./User";

@Entity("businesses")
export class Business {
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
  taxNumber?: string;

  @Column({ default: false })
  @IsBoolean()
  applyVAT!: boolean;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  vatRate?: number;

  @Column({ default: "UGX" })
  currency!: string;

  @Column({ nullable: true })
  @IsOptional()
  logo?: string;

  @Column({ type: "simple-json", nullable: true })
  settings?: Record<string, any>;

  @Column({ nullable: true })
  @IsOptional()
  receiptFooter?: string;

  @OneToMany(() => Branch, (branch) => branch.business)
  branches!: Branch[];

  @ManyToOne(() => User, (user) => user.ownedBusinesses, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  owner!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ default: false })
  isDeleted!: boolean;

  @Column({ nullable: true })
  @IsOptional()
  businessType?: string;
}
