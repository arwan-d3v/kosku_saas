import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';

@Injectable()
export class PropertiesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createProperty(
    userId: string,
    data: {
      name: string;
      address: string;
      city: string;
      description?: string;
      facilities?: string[];
    },
  ) {
    const supabase = this.supabaseService.getClient();

    const { data: property, error } = await supabase
      .from('properties')
      .insert({
        owner_id: userId,
        name: data.name,
        address: data.address,
        description: data.description || '',
        city: data.city || 'Unknown',
        facilities: data.facilities || [],
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return property;
  }

  async getPropertiesByOwner(userId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: properties, error } = await supabase
      .from('properties')
      .select('*, rooms(*)')
      .eq('owner_id', userId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return properties;
  }

  async getPropertyById(userId: string, propertyId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('owner_id', userId)
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!property) {
      // In Supabase, .single() throws if not found, but just in case
      throw new InternalServerErrorException('Property not found');
    }

    return property;
  }

  async uploadPropertyImage(
    userId: string,
    propertyId: string,
    file: Express.Multer.File,
  ) {
    const supabase = this.supabaseService.getClient();

    // Verify ownership
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('images, owner_id')
      .eq('id', propertyId)
      .single();

    if (propError || !property) {
      throw new InternalServerErrorException('Property not found');
    }

    if (property.owner_id !== userId) {
      throw new InternalServerErrorException('Unauthorized');
    }

    // Upload to Supabase Storage
    const fileName = `${propertyId}/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    const publicUrl = await this.supabaseService.uploadFile(
      'property_images',
      fileName,
      file,
    );

    // Update property images array
    const currentImages = property.images || [];
    const { error: updateError } = await supabase
      .from('properties')
      .update({ images: [...currentImages, publicUrl] })
      .eq('id', propertyId);

    if (updateError) {
      throw new InternalServerErrorException(
        'Failed to update property images',
      );
    }

    return { url: publicUrl };
  }

  async getAllPublicProperties() {
    const supabase = this.supabaseService.getClient();

    // Query properties and include their rooms using Supabase join syntax
    const { data: properties, error } = await supabase.from('properties')
      .select(`
        *,
        rooms (*)
      `);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return properties;
  }

  async getPublicPropertyById(propertyId: string) {
    const supabase = this.supabaseService.getClient();

    const { data: property, error } = await supabase
      .from('properties')
      .select(
        `
        *,
        rooms (*)
      `,
      )
      .eq('id', propertyId)
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!property) {
      throw new InternalServerErrorException('Property not found');
    }

    return property;
  }

  async updateProperty(
    userId: string,
    propertyId: string,
    data: {
      name?: string;
      address?: string;
      city?: string;
      description?: string;
      facilities?: string[];
    },
  ) {
    const supabase = this.supabaseService.getClient();

    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.address !== undefined) updatePayload.address = data.address;
    if (data.city !== undefined) updatePayload.city = data.city;
    if (data.description !== undefined)
      updatePayload.description = data.description;
    if (data.facilities !== undefined)
      updatePayload.facilities = data.facilities;

    const { data: property, error } = await supabase
      .from('properties')
      .update(updatePayload)
      .eq('id', propertyId)
      .eq('owner_id', userId)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return property;
  }

  async deleteProperty(userId: string, propertyId: string) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .eq('owner_id', userId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return { success: true };
  }
}
