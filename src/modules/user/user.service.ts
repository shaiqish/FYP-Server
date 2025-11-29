import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import {
  DuplicateResourceException,
  InvalidCredentialsException,
  ResourceNotFoundException,
} from 'src/common/exceptions/custom.exception';
import * as bcrypt from 'bcrypt';

/**
 * User Service
 * Handles user CRUD operations, authentication, and password management
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new ResourceNotFoundException('User', `email: ${email}`);
    }

    return user;
  }

  /**
   * Find user by password reset token
   */
  async findByResetToken(token: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user) {
      throw new ResourceNotFoundException('User', `reset token`);
    }

    return user;
  }

  /**
   * Create a new user with hashed password
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new DuplicateResourceException('User', 'email');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      role: 'user',
      profile: {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
      },
    });

    return this.userRepository.save(user);
  }

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    return user;
  }

  /**
   * Get all users
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['profile'] });
  }

  /**
   * Get user by ID
   */
  async findOneById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });

    if (!user) {
      throw new ResourceNotFoundException('User', `id: ${id}`);
    }

    return user;
  }

  /**
   * Update user information
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(id);

    if (updateUserDto.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new DuplicateResourceException('User', 'email');
      }
      user.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.userRepository.save(user);
  }

  /**
   * Delete user by ID
   */
  async delete(id: string): Promise<{ message: string }> {
    const user = await this.findOneById(id);
    await this.userRepository.remove(user);
    return { message: `User with ID ${id} deleted successfully` };
  }

  /**
   * Update password reset token
   */
  async updatePasswordResetToken(
    id: string,
    token: string,
    expiry: Date,
  ): Promise<void> {
    await this.userRepository.update(
      { id },
      {
        passwordResetToken: token,
        passwordResetTokenExpires: expiry,
      },
    );
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update({ id }, { password: hashedPassword });
  }

  /**
   * Clear password reset token after successful reset
   */
  async clearPasswordResetToken(id: string): Promise<void> {
    await this.userRepository.update(
      { id },
      {
        passwordResetToken: undefined,
        passwordResetTokenExpires: undefined,
      },
    );
  }
}
