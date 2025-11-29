import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Thrown when a resource already exists (e.g., duplicate email)
 */
export class DuplicateResourceException extends ConflictException {
  constructor(resource: string, field: string) {
    super(`${resource} with this ${field} already exists`);
  }
}

/**
 * Thrown when a resource is not found
 */
export class ResourceNotFoundException extends NotFoundException {
  constructor(resource: string, identifier?: string) {
    super(
      identifier
        ? `${resource} with ${identifier} not found`
        : `${resource} not found`,
    );
  }
}

/**
 * Thrown when authentication fails (invalid credentials)
 */
export class InvalidCredentialsException extends UnauthorizedException {
  constructor(message = 'Invalid email or password') {
    super(message);
  }
}

/**
 * Thrown when a token is invalid or expired
 */
export class InvalidTokenException extends UnauthorizedException {
  constructor(message = 'Invalid or expired token') {
    super(message);
  }
}

/**
 * Thrown when user lacks required permissions
 */
export class InsufficientPermissionsException extends ForbiddenException {
  constructor(message = 'Insufficient permissions') {
    super(message);
  }
}

/**
 * Thrown for invalid input validation
 */
export class ValidationFailedException extends BadRequestException {
  constructor(field: string, message: string) {
    super(`Validation failed for ${field}: ${message}`);
  }
}

/**
 * Thrown for unexpected server errors
 */
export class InternalException extends InternalServerErrorException {
  constructor(message = 'An unexpected error occurred') {
    super(message);
  }
}
