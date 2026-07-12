import { Controller, Post, Get, Patch, Delete, Body, Req, UseGuards, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PropertiesService } from './properties.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('properties')
@UseGuards(SupabaseAuthGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  async createProperty(@Req() request: any, @Body() body: { name: string; address: string; description?: string; facilities?: string[] }) {
    const userId = request.user.id;
    return this.propertiesService.createProperty(userId, body);
  }

  @Get()
  async getProperties(@Req() request: any) {
    const userId = request.user.id;
    return this.propertiesService.getPropertiesByOwner(userId);
  }

  @Get(':id')
  async getProperty(@Req() request: any, @Param('id') propertyId: string) {
    const userId = request.user.id;
    return this.propertiesService.getPropertyById(userId, propertyId);
  }

  @Patch(':id')
  async updateProperty(
    @Req() request: any, 
    @Param('id') propertyId: string, 
    @Body() body: { name?: string; address?: string; description?: string; facilities?: string[] }
  ) {
    const userId = request.user.id;
    return this.propertiesService.updateProperty(userId, propertyId, body);
  }

  @Delete(':id')
  async deleteProperty(@Req() request: any, @Param('id') propertyId: string) {
    const userId = request.user.id;
    return this.propertiesService.deleteProperty(userId, propertyId);
  }

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPropertyImage(
    @Req() request: any,
    @Param('id') propertyId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = request.user.id;
    return this.propertiesService.uploadPropertyImage(userId, propertyId, file);
  }
}
