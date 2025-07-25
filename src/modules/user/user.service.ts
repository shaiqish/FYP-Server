import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDTO } from './dto/update-user-dto';
import { CreateUserDto } from './dto/create-user-dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }

  async create(data: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new ConflictException('Email already exists');

    const hashed = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      email: data.email,
      password: hashed,
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl,
      },
    });
    return this.userRepository.save(user);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // READ: Get one user by ID
  async findOneById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // UPDATE: Modify user email and/or password
  async update(id: string, updateDto: UpdateUserDTO): Promise<User> {
    const user = await this.findOneById(id);

    if (updateDto.email) {
      const existing = await this.findByEmail(updateDto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already exists');
      }
      user.email = updateDto.email;
    }

    if (updateDto.password) {
      user.password = await bcrypt.hash(updateDto.password, 10);
    }

    return this.userRepository.save(user);
  }

  // DELETE: Remove a user
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.findOneById(id);
    await this.userRepository.remove(user);
    return { message: `User with ID ${id} removed.` };
  }
}
