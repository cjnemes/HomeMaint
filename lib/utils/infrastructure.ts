/**
 * Shared utility functions for infrastructure services
 */

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

/**
 * Sanitize error for user-facing messages
 * Prevents information disclosure while maintaining debugging capability
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // Always log full error server-side for debugging
    console.error('Full error details:', error);

    // Return safe message based on environment
    if (process.env.NODE_ENV === 'development') {
      return error.message;
    }

    // In production, return generic message
    return 'Operation failed. Please check server logs for details.';
  }

  return 'An unexpected error occurred';
}

/**
 * Sleep for specified milliseconds (async)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate filename to prevent directory traversal and other attacks
 */
export function validateFilename(filename: string, options?: {
  maxLength?: number;
  allowedExtensions?: string[];
  pattern?: RegExp;
}): void {
  const { maxLength = 255, allowedExtensions, pattern } = options || {};

  // Check length
  if (filename.length === 0) {
    throw new Error('Filename cannot be empty');
  }

  if (filename.length > maxLength) {
    throw new Error(`Filename too long (max ${maxLength} characters)`);
  }

  // Check for path traversal attempts
  const dangerous = ['..', '~', '//', '\\\\', '\0', '\n', '\r', '\t'];
  for (const pattern of dangerous) {
    if (filename.includes(pattern)) {
      throw new Error('Invalid filename: contains dangerous characters');
    }
  }

  // Check for forward/backward slashes (path separators)
  if (filename.includes('/') || filename.includes('\\')) {
    throw new Error('Invalid filename: path separators not allowed');
  }

  // Check for URL-encoded traversal attempts
  const urlEncodedDangerous = ['%2e', '%2f', '%5c', '%00'];
  const lowerFilename = filename.toLowerCase();
  for (const encoded of urlEncodedDangerous) {
    if (lowerFilename.includes(encoded)) {
      throw new Error('Invalid filename: URL-encoded characters not allowed');
    }
  }

  // Validate file extension if specified
  if (allowedExtensions && allowedExtensions.length > 0) {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(`.${ext}`)) {
      throw new Error(
        `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`
      );
    }
  }

  // Validate against custom pattern if provided
  if (pattern && !pattern.test(filename)) {
    throw new Error('Invalid filename format');
  }
}
