import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

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
	createVendor(@Body() vendorDto: CreateVendorDto) {
		return this.vendorsService.createVendor(vendorDto);
	}

	@Put(':id')
	updateVendor(@Body() vendorDto: UpdateVendorDto, @Param('id') id: number) {
		return this.vendorsService.updateVendor(vendorDto, id);
	}

	@Delete(':id')
	deleteVendor(@Param('id') id: number) {
		return this.vendorsService.deleteVendor(id);
	}
}
