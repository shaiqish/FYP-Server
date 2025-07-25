import { Post } from 'src/modules/post/entities/post.entity';
import { Profile } from 'src/modules/profile/entity/profile.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  profile?: Profile;

  @OneToMany(() => Post, (post) => post.user, {
    cascade: true, // Optional: creates posts when you create a user with posts
  })
  posts?: Post[];
}
