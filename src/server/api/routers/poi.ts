import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { LandmarkType } from "@prisma/client";

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
    let where = undefined;
    if (input?.type && Object.values(LandmarkType).includes(input.type as LandmarkType)) {
      where = { type: input.type as LandmarkType };
    }
    return ctx.db.landmark.findMany({
      where,
    });
  }),
}); 