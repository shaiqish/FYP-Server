import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';

describe('RolesGuard', () => {
  it('should be defined', () => {
    const mockReflector = {} as Reflector;
    expect(new RolesGuard(mockReflector)).toBeDefined();
  });
});
