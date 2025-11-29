import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entity/profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ResourceNotFoundException } from 'src/common/exceptions/custom.exception';

/**
 * Profile Service
 * Handles profile CRUD operations and business logic
 */
@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  /**
   * Get all profiles with associated users
   */
  async findAll(): Promise<Profile[]> {
    return this.profileRepository.find({ relations: ['user'] });
  }

  /**
   * Get profile by ID
   */
  async findOneById(id: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new ResourceNotFoundException('Profile', `id: ${id}`);
    }

    return profile;
  }

  /**
   * Get profile by user ID
   */
  async findByUserId(userId: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!profile) {
      throw new ResourceNotFoundException('Profile', `userId: ${userId}`);
    }

    return profile;
  }

  /**
   * Create a new profile
   */
  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    const profile = this.profileRepository.create({
      firstName: createProfileDto.firstName,
      lastName: createProfileDto.lastName,
      linkedTutor: createProfileDto.linkedTutor,
      language: createProfileDto.language,
      interests: createProfileDto.interests || [],
      preferences: createProfileDto.preferences || [],
      pace: createProfileDto.pace,
      schedule: createProfileDto.schedule,
      difficulty: createProfileDto.difficulty,
      goals: createProfileDto.goals || [],
    });

    return this.profileRepository.save(profile);
  }

  /**
   * Update profile information
   */
  async update(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    const profile = await this.findOneById(id);

    Object.assign(profile, updateProfileDto);

    return this.profileRepository.save(profile);
  }
}
