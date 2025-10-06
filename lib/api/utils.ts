import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Handle API errors and return appropriate response
 */
export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.issues,
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: 'An unknown error occurred',
    },
    { status: 500 }
  );
}

/**
 * Parse and validate request JSON body
 */
export async function parseRequestBody<T>(request: Request, schema: any): Promise<T> {
  const body = await request.json();
  return schema.parse(body) as T;
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Not found response helper
 */
export function notFoundResponse(message: string = 'Resource not found') {
  return NextResponse.json({ error: message }, { status: 404 });
}
