import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get()
	getAllUsers() {
		return this.usersService.getAllUsers();
	}

	@Get(':id')
	getUserById(@Param('id') id: number) {
		return this.usersService.getUserById(id);
	}

	@Post()
	@UseInterceptors(FileInterceptor('avatar'))
	createUser(
		@UploadedFile() file: Express.Multer.File,
		@Body() userDto: CreateUserDto
	) {
		console.log('DTO', userDto);
		return this.usersService.createUser(userDto, file);
	}

	@Put(':id')
	updateUser(@Body() userDto: UpdateUserDto, @Param('id') id: number) {
		return this.usersService.updateUser(userDto, id);
	}

	@Delete(':id')
	deleteUser(@Param('id') id: number) {
		return this.usersService.deleteUser(id);
	}
}
