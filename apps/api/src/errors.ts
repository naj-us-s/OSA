/**
 * Central error model (master prompt §11): every handler throws an ApiError;
 * the Express error middleware maps it to JSON. Internal error details are
 * logged server-side but never sent to the client.
 */
import type { ErrorRequestHandler } from 'express';

export interface ApiErrorShape {
  error: { code: string; message: string };
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

/** Convenience factory for zod parse failures → 400 with field info. */
export function badRequest(message: string, details?: unknown) {
  return new ApiError(400, 'bad_request', message, details);
}

export function notFound(entity = 'resource') {
  return new ApiError(404, 'not_found', `${entity} not found`);
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    return;
  }
  // Database unreachable → the app itself is down; surface that honestly (§4.3)
  // instead of a generic 500 that hides the cause.
  const code = (err as { code?: string }).code;
  if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ENOTFOUND') {
    console.error('[db] connection failed:', (err as Error).message);
    res.status(503).json({
      error: { code: 'db_unavailable', message: 'Database not reachable — is Postgres running?' },
    });
    return;
  }
  // Unknown errors: log fully server-side, emit a generic message.
  console.error('[unhandled]', err);
  res.status(500).json({ error: { code: 'internal_error', message: 'Something went wrong.' } });
};
