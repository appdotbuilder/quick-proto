
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createPrototypeInputSchema, 
  updatePrototypeInputSchema, 
  uiPreviewRequestSchema 
} from './schema';

// Import handlers
import { createPrototype } from './handlers/create_prototype';
import { getPrototype } from './handlers/get_prototype';
import { getPrototypes } from './handlers/get_prototypes';
import { updatePrototype } from './handlers/update_prototype';
import { deletePrototype } from './handlers/delete_prototype';
import { generateUIPreview } from './handlers/generate_ui_preview';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Prototype CRUD operations
  createPrototype: publicProcedure
    .input(createPrototypeInputSchema)
    .mutation(({ input }) => createPrototype(input)),

  getPrototype: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getPrototype(input.id)),

  getPrototypes: publicProcedure
    .query(() => getPrototypes()),

  updatePrototype: publicProcedure
    .input(updatePrototypeInputSchema)
    .mutation(({ input }) => updatePrototype(input)),

  deletePrototype: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deletePrototype(input.id)),

  // UI generation
  generateUIPreview: publicProcedure
    .input(uiPreviewRequestSchema)
    .query(({ input }) => generateUIPreview(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
