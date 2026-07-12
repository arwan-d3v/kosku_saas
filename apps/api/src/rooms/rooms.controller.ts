import { Controller, Post, Get, Body, Req, UseGuards, Param } from '@nestjs/common';
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
    @Body() body: { room_number: string; price_per_month: number; status?: boolean }
  ) {
    const userId = request.user.id;
    return this.roomsService.createRoom(userId, propertyId, body);
  }

  @Get()
  async getRooms(@Param('propertyId') propertyId: string) {
    return this.roomsService.getRoomsByProperty(propertyId);
  }
}
