import { AxiosError } from 'axios';
import { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import { ApiResponse } from '../types';

export interface ParsedApiError {
  status: number | null;
  message: string;
  fieldErrors?: Record<string, string>;
  isNetworkError: boolean;
  isTimeout: boolean;
}

/**
 * Parses any unknown error (AxiosError, Error, or string) into a structured, user-friendly ParsedApiError.
 * Ensures stack traces and raw technical details are never exposed to the user.
 */
export function parseApiError(error: unknown, fallbackMessage = 'An unexpected error occurred. Please try again.'): ParsedApiError {
  if (!error) {
    return {
      status: null,
      message: fallbackMessage,
      isNetworkError: false,
      isTimeout: false,
    };
  }

  // Handle AxiosError
  if (isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const responseData = error.response?.data as ApiResponse<unknown> | undefined;

    // Timeout check
    if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
      return {
        status,
        message: 'Request timed out. The server took too long to respond. Please try again.',
        isNetworkError: false,
        isTimeout: true,
      };
    }

    // Network / Connection failure
    if (!error.response || error.code === 'ERR_NETWORK') {
      return {
        status: null,
        message: 'Unable to connect to the server. Please check your internet connection.',
        isNetworkError: true,
        isTimeout: false,
      };
    }

    // Extract backend message and field errors if available
    const backendMessage = responseData?.message?.trim();
    const fieldErrors = responseData?.errors && typeof responseData.errors === 'object'
      ? (responseData.errors as Record<string, string>)
      : undefined;

    // Status-specific friendly messaging
    switch (status) {
      case 400:
        return {
          status,
          message: backendMessage || 'Invalid request. Please verify your inputs and try again.',
          fieldErrors,
          isNetworkError: false,
          isTimeout: false,
        };

      case 401:
        return {
          status,
          message: backendMessage || 'Authentication failed. Please sign in again.',
          fieldErrors,
          isNetworkError: false,
          isTimeout: false,
        };

      case 403:
        return {
          status,
          message: backendMessage || 'Access Denied: You do not have permission to perform this action.',
          fieldErrors,
          isNetworkError: false,
          isTimeout: false,
        };

      case 404:
        return {
          status,
          message: backendMessage || 'The requested resource could not be found.',
          fieldErrors,
          isNetworkError: false,
          isTimeout: false,
        };

      case 409:
        return {
          status,
          message: backendMessage || 'A conflict occurred. An account or record with this information already exists.',
          fieldErrors,
          isNetworkError: false,
          isTimeout: false,
        };

      case 422:
        return {
          status,
          message: backendMessage || 'Validation failed. Please correct the highlighted fields.',
          fieldErrors,
          isNetworkError: false,
          isTimeout: false,
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          status,
          message: 'An internal server error occurred. Our team has been notified. Please try again later.',
          fieldErrors,
          isNetworkError: false,
          isTimeout: false,
        };

      default:
        return {
          status,
          message: backendMessage || fallbackMessage,
          fieldErrors,
          isNetworkError: false,
          isTimeout: false,
        };
    }
  }

  // Handle standard JavaScript Error
  if (error instanceof Error) {
    return {
      status: null,
      message: error.message || fallbackMessage,
      isNetworkError: false,
      isTimeout: false,
    };
  }

  return {
    status: null,
    message: typeof error === 'string' ? error : fallbackMessage,
    isNetworkError: false,
    isTimeout: false,
  };
}

/**
 * Extracts a single sanitized error message string from an unknown error.
 */
export function getErrorMessage(error: unknown, fallbackMessage?: string): string {
  return parseApiError(error, fallbackMessage).message;
}

/**
 * Type guard to check if an unknown object is an AxiosError.
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return Boolean(error && typeof error === 'object' && 'isAxiosError' in error && error.isAxiosError);
}

/**
 * Applies backend validation errors directly to React Hook Form fields.
 * Returns true if at least one field error was set.
 */
export function applyServerFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>
): boolean {
  const parsed = parseApiError(error);
  if (!parsed.fieldErrors || Object.keys(parsed.fieldErrors).length === 0) {
    return false;
  }

  let hasSetError = false;
  Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
    if (message) {
      setError(field as Path<T>, {
        type: 'server',
        message,
      });
      hasSetError = true;
    }
  });

  return hasSetError;
}
