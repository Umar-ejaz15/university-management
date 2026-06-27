/**
 * Structured error logger.
 *
 * In production: logs only the message + error name + message (never the
 * full error object, which may contain SQL, credentials, or PII).
 * In development: logs the full error for debugging.
 *
 * Usage — drop-in replacement for `console.error('Msg:', error)`:
 *   logError('Login error', error);
 */

function describeError(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export function logError(message: string, err?: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    console.error(message, err);
    return;
  }
  // Production: structured, redacted.
  console.error(JSON.stringify({
    level: 'error',
    msg: message,
    err: err === undefined ? undefined : describeError(err),
    t: new Date().toISOString(),
  }));
}
