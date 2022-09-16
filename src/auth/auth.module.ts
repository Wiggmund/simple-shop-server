import { Module } from '@nestjs/common';
import { EntitiesModule } from '../entities/entities.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [EntitiesModule],
	controllers: [AuthController],
	providers: [AuthService]
})
export class AuthModule {}
