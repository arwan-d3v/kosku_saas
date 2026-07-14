import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('users')
@UseGuards(SupabaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() request: any) {
    return this.usersService.getProfile(request.user.id);
  }

  @Patch('me')
  async updateProfile(
    @Req() request: any,
    @Body() body: { full_name?: string; avatar_url?: string; phone_number?: string; university?: string; domicile_address?: string },
  ) {
    return this.usersService.updateProfile(request.user.id, body);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Req() request: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(request.user.id, file);
  }
}
