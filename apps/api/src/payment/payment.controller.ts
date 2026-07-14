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

  @Post('checkout-balance')
  async createCheckoutBalanceToken(
    @Request() req,
    @Body() body: { bookingId: string },
  ) {
    return this.paymentService.createCheckoutBalanceToken(body.bookingId, req.user.id);
  }

  @Post('confirm-balance')
  async confirmBalancePayment(@Request() req, @Body() body: { bookingId: string }) {
    return this.paymentService.confirmBalancePayment(body.bookingId, req.user.id);
  }
}
