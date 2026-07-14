import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';

@Injectable()
export class PaymentService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createCheckoutToken(bookingId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    // 1. Verify booking exists and belongs to the user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('customer_id', userId)
      .single();

    if (bookingError || !booking) {
      throw new NotFoundException('Data booking tidak ditemukan');
    }

    if (booking.status === 'PAID') {
      throw new BadRequestException('Booking ini sudah dibayar');
    }

    // 2. Generate a mock Snap token
    const mockToken = `snap-token-mock-${bookingId}-${Date.now()}`;

    // 3. Update the booking with the token
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ payment_token: mockToken })
      .eq('id', bookingId);

    if (updateError) {
      throw new InternalServerErrorException(
        'Gagal memperbarui token pembayaran',
      );
    }

    return { token: mockToken };
  }

  async confirmPayment(bookingId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    // 1. Verify booking exists and belongs to the user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, rooms(*)')
      .eq('id', bookingId)
      .eq('customer_id', userId)
      .single();

    if (bookingError || !booking) {
      throw new NotFoundException('Data booking tidak ditemukan');
    }

    if (booking.status === 'PAID') {
      return { success: true, message: 'Booking sudah terbayar' };
    }

    // 2. Update booking status to PAID
    const { error: updateBookingError } = await supabase
      .from('bookings')
      .update({ status: 'PAID' })
      .eq('id', bookingId);

    if (updateBookingError) {
      throw new InternalServerErrorException(
        'Gagal memperbarui status pembayaran: ' + updateBookingError.message,
      );
    }

    // 3. Update room status to occupied (is_available = false)
    const { error: updateRoomError } = await supabase
      .from('rooms')
      .update({ is_available: false })
      .eq('id', booking.room_id);

    if (updateRoomError) {
      throw new InternalServerErrorException(
        'Gagal memperbarui ketersediaan kamar: ' + updateRoomError.message,
      );
    }

    return { success: true, message: 'Pembayaran berhasil dikonfirmasi' };
  }

  async createCheckoutBalanceToken(bookingId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    // 1. Verify booking exists, belongs to user, and balance is not paid
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('customer_id', userId)
      .single();

    if (bookingError || !booking) {
      throw new NotFoundException('Data booking tidak ditemukan');
    }

    if (booking.balance_paid) {
      throw new BadRequestException('Sisa tagihan sudah dilunasi');
    }

    if (booking.payment_type === 'FULL') {
      throw new BadRequestException('Tipe pembayaran ini tidak memiliki sisa tagihan');
    }

    // 2. Generate a mock Snap token
    const mockToken = `snap-token-balance-mock-${bookingId}-${Date.now()}`;

    // Note: in a real app you might save this specific token to the DB if needed.
    
    return { token: mockToken };
  }

  async confirmBalancePayment(bookingId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    // 1. Verify booking exists and belongs to the user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('customer_id', userId)
      .single();

    if (bookingError || !booking) {
      throw new NotFoundException('Data booking tidak ditemukan');
    }

    if (booking.balance_paid) {
      return { success: true, message: 'Sisa tagihan sudah dilunasi' };
    }

    // 2. Update booking balance_paid to true
    const { error: updateBookingError } = await supabase
      .from('bookings')
      .update({ balance_paid: true })
      .eq('id', bookingId);

    if (updateBookingError) {
      throw new InternalServerErrorException(
        'Gagal memperbarui status pelunasan: ' + updateBookingError.message,
      );
    }

    return { success: true, message: 'Pelunasan sisa tagihan berhasil dikonfirmasi' };
  }
}
