import { serve } from '@hono/node-server';
import { app } from './index.js';

const port = Number(process.env.PORT) || 8000;

console.log(`[RoadmapIQ Vercel-Native API] Local dev server starting on http://localhost:${port}`);
serve({
  fetch: app.fetch,
  port,
});
