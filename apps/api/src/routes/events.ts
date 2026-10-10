/**
 * Events handlers — Personal OS scheduling domain (§5.2D).
 * startsAt/endsAt are ISO-8601 instants; the DB stores DATEIME WITH TIME ZONE.
 */
import { asc, eq, gte } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { badRequest, notFound } from '../errors.js';
import { db } from '../db/client.js';
import { events } from '../db/schema.js';

export const createEventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).nullish(),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }).nullish(),
});

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function listUpcoming(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await db
      .select()
      .from(events)
      .where(gte(events.startsAt, new Date()))
      .orderBy(asc(events.startsAt));
    res.json({ events: rows });
  } catch (e) {
    next(e);
  }
}

export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest('Invalid event body', parsed.error.flatten().fieldErrors);
    if (parsed.data.endsAt && parsed.data.endsAt < parsed.data.startsAt) {
      throw badRequest('endsAt must be after startsAt');
    }
    // Drizzle wants Date objects for timestamptz columns.
    const values = {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
    };
    const [row] = await db.insert(events).values(values).returning();
    res.status(201).json({ event: row });
  } catch (e) {
    next(e);
  }
}

export async function deleteEvent(req: Request, res: Response, next: NextFunction) {
  try {
    // Express 4 types params as string | undefined → narrow before use.
    const id = req.params.id;
    if (!id || !UUID_RE.test(id)) throw badRequest('Invalid id');
    const [row] = await db.delete(events).where(eq(events.id, id)).returning({ id: events.id });
    if (!row) throw notFound('event');
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}
