import { Injectable, InternalServerErrorException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';

@Injectable()
export class RoomsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createRoom(userId: string, propertyId: string, data: { room_number: string; price_per_month: number; status?: boolean; facilities?: string[] }) {
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
        facilities: data.facilities || [],
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

  async updateRoom(roomId: string, propertyId: string, userId: string, data: { room_number?: string; price_per_month?: number; status?: boolean; facilities?: string[] }) {
    const supabase = this.supabaseService.getClient();

    // Verify property ownership
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('owner_id')
      .eq('id', propertyId)
      .single();

    if (propError || !property) {
      throw new NotFoundException('Property not found');
    }

    if (property.owner_id !== userId) {
      throw new UnauthorizedException('You are not authorized to update rooms in this property');
    }

    const updates: any = {};
    if (data.room_number !== undefined) updates.room_number = data.room_number;
    if (data.price_per_month !== undefined) updates.price_per_month = data.price_per_month;
    if (data.status !== undefined) updates.is_available = data.status;
    if (data.facilities !== undefined) updates.facilities = data.facilities;

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', roomId)
      .eq('property_id', propertyId)
      .select()
      .single();

    if (roomError) {
      throw new InternalServerErrorException(roomError.message);
    }

    return room;
  }

  async deleteRoom(roomId: string, propertyId: string, userId: string) {
    const supabase = this.supabaseService.getClient();

    // Verify property ownership
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('owner_id')
      .eq('id', propertyId)
      .single();

    if (propError || !property) {
      throw new NotFoundException('Property not found');
    }

    if (property.owner_id !== userId) {
      throw new UnauthorizedException('You are not authorized to delete rooms in this property');
    }

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId)
      .eq('property_id', propertyId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return { success: true, message: 'Room deleted successfully' };
  }
}
