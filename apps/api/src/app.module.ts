import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [AuthModule, PropertiesModule, RoomsModule, BookingsModule, PaymentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
