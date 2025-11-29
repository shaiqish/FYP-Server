import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entity/user.entity';

/**
 * Profile entity representing extended user preferences & metadata
 */
@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  linkedTutor?: string;

  @Column({ nullable: true })
  language?: string;

  @Column('text', { array: true })
  interests: string[];

  @Column('text', { array: true })
  preferences: string[];

  @Column()
  pace: string;

  @Column()
  schedule: string;

  @Column()
  difficulty: string;

  @Column('text', { array: true })
  goals: string[];

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
