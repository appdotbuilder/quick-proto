
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createPrototypeInputSchema, 
  updatePrototypeInputSchema,
  getPrototypeInputSchema,
  deletePrototypeInputSchema
} from './schema';

// Import handlers
import { createPrototype } from './handlers/create_prototype';
import { getPrototypes } from './handlers/get_prototypes';
import { getPrototype } from './handlers/get_prototype';
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
  
  // Create a new prototype based on five key questions
  createPrototype: publicProcedure
    .input(createPrototypeInputSchema)
    .mutation(({ input }) => createPrototype(input)),
    
  // Get all prototypes
  getPrototypes: publicProcedure
    .query(() => getPrototypes()),
    
  // Get a specific prototype by ID
  getPrototype: publicProcedure
    .input(getPrototypeInputSchema)
    .query(({ input }) => getPrototype(input)),
    
  // Update an existing prototype
  updatePrototype: publicProcedure
    .input(updatePrototypeInputSchema)
    .mutation(({ input }) => updatePrototype(input)),
    
  // Delete a prototype
  deletePrototype: publicProcedure
    .input(deletePrototypeInputSchema)
    .mutation(({ input }) => deletePrototype(input)),
    
  // Generate UI preview for testing
  generateUIPreview: publicProcedure
    .input(getPrototypeInputSchema)
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
