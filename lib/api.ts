import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

/**
 * Parse and validate a JSON request body against a Zod schema.
 *
 * On failure, responds with HTTP 400 and a flattened error map.
 * On success, returns the typed parsed payload (use a type guard).
 *
 * Usage:
 *   const parsed = await parseBody(request, CreateProjectSchema);
 *   if (parsed instanceof NextResponse) return parsed; // validation error
 *   // parsed is now the typed data
 */
export async function parseBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<T | NextResponse> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  try {
    return schema.parse(json);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: err.flatten() },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Validation error' }, { status: 400 });
  }
}

/**
 * Type guard: returns true if parseBody returned data (not an error response).
 */
export function isParsed<T>(value: T | NextResponse): value is T {
  return !(value instanceof NextResponse);
}
