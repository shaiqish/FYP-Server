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

  @Column('text', { array: true, nullable: true })
  interests?: string[];

  @Column('text', { array: true, nullable: true })
  preferences?: string[];

  @Column({ nullable: true })
  pace?: string;

  @Column({ nullable: true })
  schedule?: string;

  @Column({ nullable: true })
  difficulty?: string;

  @Column('text', { array: true, nullable: true })
  goals?: string[];

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
