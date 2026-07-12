import { Controller, Post, Get, Patch, Delete, Body, Req, UseGuards, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoomsService } from './rooms.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('properties/:propertyId/rooms')
@UseGuards(SupabaseAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async createRoom(
    @Req() request: any,
    @Param('propertyId') propertyId: string,
    @Body() body: { room_number: string; price_per_month: number; status?: boolean; facilities?: string[]; images?: string[]; allow_dp_10?: boolean; allow_dp_25?: boolean }
  ) {
    const userId = request.user.id;
    return this.roomsService.createRoom(userId, propertyId, body);
  }

  @Get()
  async getRooms(@Param('propertyId') propertyId: string) {
    return this.roomsService.getRoomsByProperty(propertyId);
  }

  @Patch(':roomId')
  async updateRoom(
    @Req() request: any,
    @Param('propertyId') propertyId: string,
    @Param('roomId') roomId: string,
    @Body() body: { room_number?: string; price_per_month?: number; status?: boolean; facilities?: string[]; images?: string[]; allow_dp_10?: boolean; allow_dp_25?: boolean }
  ) {
    const userId = request.user.id;
    return this.roomsService.updateRoom(roomId, propertyId, userId, body);
  }

  @Delete(':roomId')
  async deleteRoom(
    @Req() request: any,
    @Param('propertyId') propertyId: string,
    @Param('roomId') roomId: string
  ) {
    const userId = request.user.id;
    return this.roomsService.deleteRoom(roomId, propertyId, userId);
  }

  @Post(':roomId/images')
  @UseInterceptors(FileInterceptor('file'))
  async uploadRoomImage(
    @Req() request: any,
    @Param('propertyId') propertyId: string,
    @Param('roomId') roomId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = request.user.id;
    return this.roomsService.uploadRoomImage(userId, propertyId, roomId, file);
  }
}
