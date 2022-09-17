import { MulterModule } from '@nestjs/platform-express';
import { Module } from '@nestjs/common';
import { EntitiesModule } from '../entities/entities.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [EntitiesModule, MulterModule],
	controllers: [AuthController],
	providers: [AuthService]
})
export class AuthModule {}
