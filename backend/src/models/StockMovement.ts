import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { IsOptional, IsNumber, IsEnum } from "class-validator";
import { Item } from "./Item";
import { User } from "./User";

export enum MovementType {
  IN = "in",
  OUT = "out",
  ADJUSTMENT = "adjustment",
  SALE = "sale",
  RETURN = "return",
  DAMAGE = "damage",
  TRANSFER = "transfer",
  PRODUCTIONINPUT = "production_input",
  PRODUCTIONOUTPUT = "production_output",
}

@Entity("stock_movements")
@Index(["itemId", "createdAt"])
@Index(["type", "createdAt"])
export class StockMovement {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text")
  @IsEnum(MovementType)
  type!: MovementType;

  @Column("int")
  @IsNumber()
  quantity!: number;

  @Column("int")
  @IsNumber()
  previousStock!: number;

  @Column("int")
  @IsNumber()
  newStock!: number;

  @Column({ nullable: true })
  @IsOptional()
  reason?: string;

  @Column({ nullable: true })
  @IsOptional()
  reference?: string; // Sale ID, Transfer ID, etc.

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  unitCost?: number;

  @ManyToOne(() => Item, (item) => item.stockMovements)
  @JoinColumn({ name: "itemId" })
  item!: Item;

  @Column("uuid")
  itemId!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "userId" })
  user?: User;

  @Column("uuid", { nullable: true })
  userId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "datetime", nullable: true })
  lastSyncAt?: Date;

  @Column({ default: false })
  isDeleted!: boolean;
}
