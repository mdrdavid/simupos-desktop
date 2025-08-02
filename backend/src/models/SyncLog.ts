import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";
import { IsNotEmpty, IsEnum } from "class-validator";

export enum SyncOperation {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  PERMANENT_DELETE = "permanet_delete"
}

export enum SyncStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

@Entity("sync_logs")
@Index(["entityType", "entityId"])
@Index(["userId", "createdAt"])
export class SyncLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  @IsNotEmpty()
  entityType!: string;

  @Column("uuid")
  @IsNotEmpty()
  entityId!: string;

@Column({
  type: "text",
})
@IsEnum(SyncOperation)
operation!: SyncOperation;

@Column({
  type: "text",
  default: SyncStatus.PENDING,
})
@IsEnum(SyncStatus)
status!: SyncStatus;

  @Column({ type: "jsonb" })
  data!: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  error?: Record<string, any>;

  @Column("uuid")
  userId!: string;

  @Column("uuid", { nullable: true })
  branchId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  syncedAt?: Date;
}
