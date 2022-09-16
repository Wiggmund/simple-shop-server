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
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { DtoValidationPipe } from '../../common/pipes/dto-validation.pipe';
import { Roles } from '../../common/decorators/role.decorator';

@Roles(RolesEnum.Admin)
@UseGuards(JwtRolesGuard)
@Controller('vendors')
export class VendorsController {
	constructor(private vendorsService: VendorsService) {}

	@Get()
	getAllVendors() {
		return this.vendorsService.getAllVendors();
	}

	@Get(':id')
	getVendorById(@Param('id') id: number) {
		return this.vendorsService.getVendorById(id);
	}

	@Post()
	createVendor(@Body(DtoValidationPipe) vendorDto: CreateVendorDto) {
		return this.vendorsService.createVendor(vendorDto);
	}

	@Put(':id')
	updateVendor(
		@Body(DtoValidationPipe) vendorDto: UpdateVendorDto,
		@Param('id') id: number
	) {
		return this.vendorsService.updateVendor(vendorDto, id);
	}

	@Delete(':id')
	deleteVendor(@Param('id') id: number) {
		return this.vendorsService.deleteVendor(id);
	}
}
