import { RolesEnum } from './../../common/enums/roles.enum';
import { JwtRolesGuard } from './../../common/guards/jwt-role.guard';
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
import { DtoValidationPipe } from '../../common/pipes/dto-validation.pipe';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { Roles } from '../../common/decorators/role.decorator';

@Roles(RolesEnum.Admin)
@UseGuards(JwtRolesGuard)
@Controller('attributes')
export class AttributesController {
	constructor(private attributesService: AttributesService) {}

	@Get()
	getAllAttributes() {
		return this.attributesService.getAllAttributes();
	}

	@Get(':id')
	getAttributeById(@Param('id') id: number) {
		return this.attributesService.getAttributeById(id);
	}

	@Post()
	createAttribute(@Body(DtoValidationPipe) attributeDto: CreateAttributeDto) {
		return this.attributesService.createAttribute(attributeDto);
	}

	@Put(':id')
	updateAttribute(
		@Body(DtoValidationPipe) attributeDto: UpdateAttributeDto,
		@Param('id') id: number
	) {
		return this.attributesService.updateAttribute(attributeDto, id);
	}

	@Delete(':id')
	deleteAttribute(@Param('id') id: number) {
		return this.attributesService.deleteAttribute(id);
	}
}
