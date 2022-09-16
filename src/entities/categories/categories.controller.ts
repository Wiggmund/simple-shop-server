import { JwtRolesGuard } from './../../common/guards/jwt-role.guard';
import { RolesEnum } from './../../common/enums/roles.enum';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	UseGuards
} from '@nestjs/common';
import { Roles } from '../../common/decorators/role.decorator';
import { DtoValidationPipe } from '../../common/pipes/dto-validation.pipe';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Roles(RolesEnum.Admin)
@UseGuards(JwtRolesGuard)
@Controller('categories')
export class CategoriesController {
	constructor(private categoriesService: CategoriesService) {}

	@Get()
	getAllCategories() {
		return this.categoriesService.getAllCategories();
	}

	@Get(':id')
	getCategoryById(@Param('id') id: number) {
		return this.categoriesService.getCategoryById(id);
	}

	@Post()
	createCategory(@Body(DtoValidationPipe) categoryDto: CreateCategoryDto) {
		return this.categoriesService.createCategory(categoryDto);
	}

	@Put(':id')
	updateCategory(
		@Body(DtoValidationPipe) categoryDto: UpdateCategoryDto,
		@Param('id') id: number
	) {
		return this.categoriesService.updateCategory(categoryDto, id);
	}

	@Delete(':id')
	deleteCategory(@Param('id') id: number) {
		return this.categoriesService.deleteCategory(id);
	}
}
