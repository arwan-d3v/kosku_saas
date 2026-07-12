import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('bookings')
@UseGuards(SupabaseAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async createBooking(
    @Request() req,
    @Body() body: { roomId: string; startDate: string; endDate?: string }
  ) {
    return this.bookingsService.createBooking(req.user.id, body.roomId, body.startDate, body.endDate);
  }

  @Get()
  async getBookings(@Request() req) {
    return this.bookingsService.getBookings(req.user.id);
  }

  @Get(':id')
  async getBookingById(@Request() req, @Param('id') id: string) {
    return this.bookingsService.getBookingById(req.user.id, id);
  }
}
