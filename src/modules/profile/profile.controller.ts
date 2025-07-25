import { Controller, Get } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { get } from 'http';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  findAll() {
    return this.profileService.findAll();
  }
}
