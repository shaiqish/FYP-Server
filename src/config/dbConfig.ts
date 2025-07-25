import { Category } from 'src/modules/category/entities/category.entity';
import { Post } from 'src/modules/post/entities/post.entity';
import { Profile } from 'src/modules/profile/entity/profile.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const dbConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres123',
  database: 'auth',
  entities: [User, Post, Category, Profile],
  synchronize: true, // Set to false in production
};
