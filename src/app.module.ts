import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(
      process.env.NODE_ENV === 'production'
        ? {
            type: 'mariadb',
            host: process.env.DB_HOST,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            entities: [User],
            synchronize: false,
            migrationsRun: false,
          }
        : {
            type: 'sqlite',
            database: 'mail-register.db',
            entities: [User],
            synchronize: true,
            logging: false,
          },
    ),
    AuthModule,
  ],
})
export class AppModule {}
