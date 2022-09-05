import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put
} from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

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
	createAttribute(@Body() attributeDto: CreateAttributeDto) {
		return this.attributesService.createAttribute(attributeDto);
	}

	@Put(':id')
	updateAttribute(
		@Body() attributeDto: UpdateAttributeDto,
		@Param('id') id: number
	) {
		return this.attributesService.updateAttribute(attributeDto, id);
	}

	@Delete(':id')
	deleteAttribute(@Param('id') id: number) {
		return this.attributesService.deleteAttribute(id);
	}
}