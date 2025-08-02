import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class AgroCustomerDetails {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  address?: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  creditLimit?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  outstandingBalance?: number;

    @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}