import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getProfile(userId: string) {
    const supabase = this.supabaseService.getClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new NotFoundException('Profil tidak ditemukan');
    }

    return user;
  }

  async updateProfile(userId: string, data: { full_name?: string; avatar_url?: string }) {
    const supabase = this.supabaseService.getClient();

    const { data: user, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException('Gagal memperbarui profil: ' + error.message);
    }

    return user;
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const fileName = `${userId}/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    const publicUrl = await this.supabaseService.uploadFile('avatars', fileName, file);

    return this.updateProfile(userId, { avatar_url: publicUrl });
  }
}
