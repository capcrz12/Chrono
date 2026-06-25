import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RecurrenceType } from '@chrono/shared';
import { User } from '../../users/entities/user.entity';

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.reminders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'timestamptz' })
  datetime!: Date;

  @Column({
    type: 'enum',
    enum: RecurrenceType,
    default: RecurrenceType.NONE,
  })
  recurrence!: RecurrenceType;

  @Column({ type: 'boolean', default: false })
  isCompleted!: boolean;

  @Column({ type: 'varchar', nullable: true })
  googleEventId!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
