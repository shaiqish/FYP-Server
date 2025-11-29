import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';

/**
 * Application bootstrap function
 * Configures global pipes, error handling, and starts the server
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe with proper error handling
  app.useGlobalPipes(
    new ValidationPipe({
      // Transform input data to match DTO types
      transform: true,
      // Automatically remove properties that are not defined in DTOs
      forbidNonWhitelisted: true,
      // Throw error if any property fails validation
      skipMissingProperties: false,
      // Custom error factory for consistent error responses
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));
        return new BadRequestException({
          success: false,
          message: 'Validation failed',
          errors: messages,
        });
      },
    }),
  );

  // Enable CORS if needed (adjust according to your requirements)
  // app.enableCors({
  //   origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  //   credentials: true,
  // });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application started on port ${port}`);
}

bootstrap();
