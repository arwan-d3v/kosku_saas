import { Controller, Get, Param } from '@nestjs/common';
import { PropertiesService } from './properties.service';

@Controller('public/properties')
export class PublicController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  async getAllPublicProperties() {
    return this.propertiesService.getAllPublicProperties();
  }

  @Get(':id')
  async getPublicProperty(@Param('id') propertyId: string) {
    return this.propertiesService.getPublicPropertyById(propertyId);
  }
}
