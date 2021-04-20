import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Permission } from './permission.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @OneToMany(() => Permission, (object) => object.transaction, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  permissions: Permission[];
}
