/**
 * Tasks handlers — Personal OS domain (§5.2C).
 * Validation with zod at the boundary; DB access via Drizzle; no raw SQL.
 */
import { and, desc, eq, gte, lte, ne } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { badRequest, notFound } from '../errors.js';
import { db } from '../db/client.js';
import { tasks } from '../db/schema.js';

const priority = z.number().int().min(0).max(2); // 0 low · 1 medium · 2 high

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).nullish(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'dueDate must be YYYY-MM-DD')
    .nullish(),
  priority: priority.default(1),
  tags: z.array(z.string().trim().max(30)).max(10).default([]),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
});

function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw badRequest('Invalid task body', result.error.flatten().fieldErrors);
  }
  return result.data;
}

export async function listTasks(_req: Request, res: Response) {
  const rows = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  res.json({ tasks: rows });
}

export async function createTask(req: Request, res: Response) {
  const data = parseBody(createTaskSchema, req.body);
  const [row] = await db.insert(tasks).values(data).returning();
  res.status(201).json({ task: row });
}

function taskId(req: Request): string {
  // Params typed as string | undefined by Express 4 types → narrow explicitly.
  const id = req.params.id;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) throw badRequest('Invalid id');
  return id;
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const data = parseBody(updateTaskSchema, req.body);
    const id = taskId(req);

    const [row] = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    if (!row) throw notFound('task');
    res.json({ task: row });
  } catch (e) {
    next(e);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = taskId(req);
    const [row] = await db.delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id });
    if (!row) throw notFound('task');
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

function todayStartUtc(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Today view support (§5.2B): open tasks due today or earlier, plus what's already done today. */
export async function todayTasks(_req: Request, res: Response, next: NextFunction) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const open = await db
      .select()
      .from(tasks)
      .where(and(ne(tasks.status, 'done'), lte(tasks.dueDate, today)))
      .orderBy(desc(tasks.priority));
    const doneToday = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.status, 'done'), gte(tasks.updatedAt, todayStartUtc())))
      .orderBy(desc(tasks.updatedAt));
    res.json({ open, doneToday, today });
  } catch (e) {
    next(e);
  }
}
