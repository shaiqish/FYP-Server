/**
 * Standard API Response wrapper for all endpoints
 * Ensures consistent response format across the application
 */
export class ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;

  constructor(success: boolean, message: string, data?: T, error?: string) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
  }

  static success<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(true, message, data);
  }

  static error(message: string, error?: string): ApiResponse<undefined> {
    return new ApiResponse(false, message, undefined, error);
  }
}
