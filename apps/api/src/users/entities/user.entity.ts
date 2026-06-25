import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Reminder } from '../../reminders/entities/reminder.entity';
import { GoogleToken } from '../../google-calendar/entities/google-token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  passwordHash!: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId!: string | null;

  @OneToMany(() => Reminder, (reminder) => reminder.user)
  reminders!: Reminder[];

  @OneToMany(() => GoogleToken, (token) => token.user)
  googleTokens!: GoogleToken[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
