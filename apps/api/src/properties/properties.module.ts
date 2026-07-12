import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PublicController } from './public.controller';
import { PropertiesService } from './properties.service';
import { SupabaseModule } from '../common/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [PropertiesController, PublicController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
