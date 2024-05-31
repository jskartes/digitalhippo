import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  anyApiRoute: publicProcedure.query(() => "Hello!")
});

export type AppRouter = typeof appRouter;
