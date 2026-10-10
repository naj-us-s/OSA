/**
 * API entrypoint. One lightweight Express app hosting all app domains
 * (ADR-002: monolith with module boundaries). Versioned REST under /api.
 */
import './env.js'; // side-effect: load .env BEFORE db/client snapshots process.env

import cors from 'cors';
import express from 'express';

import { errorHandler } from './errors.js';
import * as tasks from './routes/tasks.js';
import * as events from './routes/events.js';
import * as summaries from './routes/summaries.js';

const app = express();
app.use(cors()); // dev: localhost frontends on different ports; tighten for deploy (§11)
app.use(express.json({ limit: '1mb' }));

// -- Personal OS domain --------------------------------------------------------
const r = express.Router();
r.get('/tasks', tasks.listTasks);
r.post('/tasks', tasks.createTask);
r.patch('/tasks/:id', tasks.updateTask);
r.delete('/tasks/:id', tasks.deleteTask);
r.get('/tasks/today', tasks.todayTasks);
r.get('/events/upcoming', events.listUpcoming);
r.post('/events', events.createEvent);
r.delete('/events/:id', events.deleteEvent);
app.use('/api', r);

// -- Integration contract (§4.3) ------------------------------------------------
app.get('/api/vocab/summary', summaries.vocabSummary);
app.get('/api/vocab/recent', summaries.vocabRecent);
app.get('/api/media/summary', summaries.mediaSummary);
app.get('/api/media/recent', summaries.mediaRecent);
app.get('/api/media/in-progress', summaries.mediaInProgress);

// health check — used by the dev boot script to know the API is up
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use(errorHandler);

// PORT=0 sometimes leaks into shells (e.g. env -i); treat 0 as "unset" so the
// documented default api port 4000 always applies.
const port = Number(process.env.PORT) > 0 ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});
