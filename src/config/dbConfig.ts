import { User } from '../modules/user/entity/user.entity';
import { Profile } from '../modules/profile/entity/profile.entity';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

/**
 * TypeORM Database Configuration
 * Configure your database connection here
 */
export const dbConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  database: process.env.DB_NAME || 'FYP',
  entities: [User, Profile],
  synchronize: process.env.NODE_ENV !== 'production', // Never use synchronize in production
  logging: process.env.NODE_ENV === 'development', // Enable logging in development
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
};
