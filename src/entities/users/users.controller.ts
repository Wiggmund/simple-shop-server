import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

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
	createUser(@Body() userDto: CreateUserDto) {
		return this.usersService.createUser(userDto);
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
