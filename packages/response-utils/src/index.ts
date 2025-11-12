export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
}

export const success = <T>(data: T, message = 'Success', statusCode = 200): ApiResponse<T> => ({
  success: true,
  message,
  data,
  statusCode
});

export const error = (message: string, statusCode = 500, error?: string): ApiResponse => ({
  success: false,
  message,
  error,
  statusCode
});

export const created = <T>(data: T, message = 'Created successfully'): ApiResponse<T> =>
  success(data, message, 201);

export const notFound = (message = 'Resource not found'): ApiResponse =>
  error(message, 404);

export const badRequest = (message = 'Bad request', validationError?: string): ApiResponse =>
  error(message, 400, validationError);

export const unauthorized = (message = 'Unauthorized'): ApiResponse =>
  error(message, 401);

export const forbidden = (message = 'Forbidden'): ApiResponse =>
  error(message, 403);

export const serverError = (message = 'Internal server error'): ApiResponse =>
  error(message, 500);

export const noContent = (message = 'No content'): ApiResponse => ({
  success: true,
  message,
  statusCode: 204
});

export const conflict = (message = 'Conflict'): ApiResponse =>
  error(message, 409);

export const validationError = (message = 'Validation failed', errors: string[]): ApiResponse => ({
  success: false,
  message,
  error: errors.join(', '),
  statusCode: 422
});

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const paginated = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message = 'Data retrieved successfully'
): PaginatedResponse<T> => ({
  success: true,
  message,
  data,
  statusCode: 200,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  }
});

export const tooManyRequests = (message = 'Too many requests'): ApiResponse => 
  error(message, 429);

export const timeout = (message = 'Request timeout'): ApiResponse => 
  error(message, 408);

export const logError = (context: string, error: unknown): void => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Error in ${context}:`, message);
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
};