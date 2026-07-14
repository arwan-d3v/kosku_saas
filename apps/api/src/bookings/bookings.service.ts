import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';

@Injectable()
export class BookingsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createBooking(
    userId: string,
    roomId: string,
    startDate: string,
    endDate?: string,
    paymentType: 'FULL' | 'DP_10' | 'DP_25' | 'CUSTOM_DP' = 'FULL',
  ) {
    const supabase = this.supabaseService.getClient();

    // 1. Get room details and verify availability
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*, properties(owner_id)')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      throw new NotFoundException('Kamar tidak ditemukan');
    }

    if (!room.is_available) {
      throw new BadRequestException(
        'Kamar ini sudah terisi atau tidak tersedia',
      );
    }

    // 2. Calculate price (minimum 1 month)
    const pricePerMonth = Number(room.price_per_month);
    let totalPrice = pricePerMonth;

    if (endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Rough monthly calculation
      const months = Math.max(1, Math.round(diffDays / 30));
      totalPrice = pricePerMonth * months;
    }

    let dpAmount: number | null = null;
    let dpExpiresAt: string | null = null;

    if (paymentType === 'DP_10') {
      if (!room.allow_dp_10)
        throw new BadRequestException('Kamar ini tidak menerima DP 10%');
      dpAmount = totalPrice * 0.1;
      const expireDate = new Date();
      expireDate.setHours(expireDate.getHours() + 24);
      dpExpiresAt = expireDate.toISOString();
    } else if (paymentType === 'DP_25') {
      if (!room.allow_dp_25)
        throw new BadRequestException('Kamar ini tidak menerima DP 25%');
      dpAmount = totalPrice * 0.25;
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 7);
      dpExpiresAt = expireDate.toISOString();
    } else if (paymentType === 'CUSTOM_DP') {
      if (!room.allow_custom_dp || !room.custom_dp_percentage)
        throw new BadRequestException('Kamar ini tidak menerima Custom DP');
      dpAmount = totalPrice * (room.custom_dp_percentage / 100);
      const expireDate = new Date();
      expireDate.setHours(expireDate.getHours() + (room.custom_dp_duration_hours || 24));
      dpExpiresAt = expireDate.toISOString();
    }

    // 3. Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        room_id: roomId,
        customer_id: userId,
        start_date: startDate,
        end_date: endDate || null,
        total_price: totalPrice,
        status: 'PENDING',
        payment_type: paymentType,
        dp_amount: dpAmount,
        dp_expires_at: dpExpiresAt,
        balance_paid: paymentType === 'FULL',
      })
      .select('*, rooms(*, properties(*))')
      .single();

    if (bookingError) {
      throw new InternalServerErrorException(
        'Gagal membuat booking: ' + bookingError.message,
      );
    }

    return booking;
  }

  async getBookings(userId: string) {
    const supabase = this.supabaseService.getClient();

    // Fetch user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new NotFoundException('Profil pengguna tidak ditemukan');
    }

    if (profile.role === 'TENANT_ADMIN' || profile.role === 'SUPERADMIN') {
      // Owner: Get bookings of rooms belonging to their properties
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(
          '*, rooms!inner(*, properties!inner(*)), customer:users!bookings_customer_id_fkey(*)',
        )
        .eq('rooms.properties.owner_id', userId);

      if (bookingsError) {
        throw new InternalServerErrorException(bookingsError.message);
      }
      return bookings;
    } else {
      // Customer: Get their own bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, rooms(*, properties(*))')
        .eq('customer_id', userId);

      if (bookingsError) {
        throw new InternalServerErrorException(bookingsError.message);
      }
      return bookings;
    }
  }

  async getBookingById(userId: string, bookingId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, rooms(*, properties(*))')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new NotFoundException('Booking tidak ditemukan');
    }

    // Verify permission
    if (
      booking.customer_id !== userId &&
      booking.rooms.properties.owner_id !== userId
    ) {
      throw new BadRequestException('Akses ditolak untuk data booking ini');
    }

    return booking;
  }
}
