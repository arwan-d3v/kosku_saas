import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('payment')
@UseGuards(SupabaseAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('checkout')
  async createCheckoutToken(
    @Request() req,
    @Body() body: { bookingId: string },
  ) {
    return this.paymentService.createCheckoutToken(body.bookingId, req.user.id);
  }

  @Post('confirm')
  async confirmPayment(@Request() req, @Body() body: { bookingId: string }) {
    return this.paymentService.confirmPayment(body.bookingId, req.user.id);
  }
}
