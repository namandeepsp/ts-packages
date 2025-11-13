export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface ResponseObject {
  status: (code: number) => ResponseObject;
  json: (data: unknown) => any;
}

export const success = <T>(data: T, message = 'Success', statusCode = 200, res?: ResponseObject): ApiResponse<T> => {
  const response = {
    success: true,
    message,
    data,
    statusCode
  };
  
  if (res) {
    return res.status(statusCode).json(response);
  }
  
  return response;
};

export const error = (message: string, statusCode = 500, error?: string, res?: ResponseObject): ApiResponse => {
  const response = {
    success: false,
    message,
    error,
    statusCode
  };
  
  if (res) {
    return res.status(statusCode).json(response);
  }
  
  return response;
};

export const created = <T>(data: T, message = 'Created successfully', res?: ResponseObject): ApiResponse<T> =>
  success(data, message, 201, res);

export const notFound = (message = 'Resource not found', res?: ResponseObject): ApiResponse =>
  error(message, 404, undefined, res);

export const badRequest = (message = 'Bad request', validationError?: string, res?: ResponseObject): ApiResponse =>
  error(message, 400, validationError, res);

export const unauthorized = (message = 'Unauthorized', res?: ResponseObject): ApiResponse =>
  error(message, 401, undefined, res);

export const forbidden = (message = 'Forbidden', res?: ResponseObject): ApiResponse =>
  error(message, 403, undefined, res);

export const serverError = (message = 'Internal server error', res?: ResponseObject): ApiResponse =>
  error(message, 500, undefined, res);

export const noContent = (message = 'No content', res?: ResponseObject): ApiResponse => {
  const response = {
    success: true,
    message,
    statusCode: 204
  };
  
  if (res) {
    return res.status(204).json(response);
  }
  
  return response;
};

export const conflict = (message = 'Conflict', res?: ResponseObject): ApiResponse =>
  error(message, 409, undefined, res);

export const validationError = (message = 'Validation failed', errors: string[], res?: ResponseObject): ApiResponse => {
  const response = {
    success: false,
    message,
    error: errors.join(', '),
    statusCode: 422
  };
  
  if (res) {
    return res.status(422).json(response);
  }
  
  return response;
};

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
  message = 'Data retrieved successfully',
  res?: ResponseObject
): PaginatedResponse<T> => {
  const response = {
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
  };
  
  if (res) {
    return res.status(200).json(response);
  }
  
  return response;
};

export const tooManyRequests = (message = 'Too many requests', res?: ResponseObject): ApiResponse => 
  error(message, 429, undefined, res);

export const timeout = (message = 'Request timeout', res?: ResponseObject): ApiResponse => 
  error(message, 408, undefined, res);

export const logError = (context: string, error: unknown): void => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Error in ${context}:`, message);
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
};

// Default export for namespace usage
const ResponseUtils = {
  success,
  error,
  created,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
  serverError,
  noContent,
  conflict,
  validationError,
  paginated,
  tooManyRequests,
  timeout,
  logError,
  getErrorMessage
};

export default ResponseUtils;