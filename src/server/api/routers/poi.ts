import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const poiRouter = createTRPCRouter({
  // Get all map patterns (with minimal info)
  allPatterns: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.mapPattern.findMany({
      select: {
        id: true,
        nightlord: true,
        patternIndex: true,
        specialEvents: true,
      },
    });
  }),

  // Get a map pattern by ID, including landmarks
  getPattern: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    return ctx.db.mapPattern.findUnique({
      where: { id: input.id },
      include: {
        patternLandmarks: {
          include: {
            landmark: true,
          },
        },
      },
    });
  }),

  // Get all landmarks (optionally filter by type)
  allLandmarks: publicProcedure.input(z.object({ type: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
    return ctx.db.landmark.findMany({
      where: input?.type ? { type: input.type } : undefined,
    });
  }),
}); 