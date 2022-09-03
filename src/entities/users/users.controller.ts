import {
	Body,
	Controller,
	Delete,
	Get,
	Post,
	Put,
	Query
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get()
	getAllUsers() {
		return this.usersService.getAllUsers();
	}

	@Get(':id')
	getUserById(@Query('id') id: number) {
		return this.usersService.getUserById(id);
	}

	@Post()
	createUser(@Body() userDto: CreateUserDto) {
		return this.usersService.createUser(userDto);
	}

	@Put()
	updateUser(@Body() userDto: UpdateUserDto) {
		return this.usersService.updateUser(userDto);
	}

	@Delete()
	removeUser(@Body() userDto: DeleteUserDto) {
		return this.usersService.removeUser(userDto);
	}
}
