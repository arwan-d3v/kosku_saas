import { Injectable, InternalServerErrorException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';

@Injectable()
export class RoomsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createRoom(userId: string, propertyId: string, data: { room_number: string; price_per_month: number; status?: boolean }) {
    const supabase = this.supabaseService.getClient();

    // 1. Verify property ownership
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('owner_id')
      .eq('id', propertyId)
      .single();

    if (propError || !property) {
      throw new NotFoundException('Property not found');
    }

    if (property.owner_id !== userId) {
      throw new UnauthorizedException('You are not authorized to add rooms to this property');
    }

    // 2. Create Room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        property_id: propertyId,
        room_number: data.room_number,
        price_per_month: data.price_per_month,
        is_available: data.status !== undefined ? data.status : true,
      })
      .select()
      .single();

    if (roomError) {
      throw new InternalServerErrorException(roomError.message);
    }

    return room;
  }

  async getRoomsByProperty(propertyId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('property_id', propertyId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return rooms;
  }
}
