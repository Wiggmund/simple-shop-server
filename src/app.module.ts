import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntitiesModule } from './entities/entities.module';
import { FileSystemModule } from './file-system/file-system.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.DB_HOST,
			port: Number(process.env.DB_PORT),
			username: process.env.POSTGRES_USER,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DB,
			entities: [],
			synchronize: true,
			autoLoadEntities: true,
			logging: true,
			logger: 'advanced-console'
		}),
		EntitiesModule,
		FileSystemModule,
		AuthModule,
		MailModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
