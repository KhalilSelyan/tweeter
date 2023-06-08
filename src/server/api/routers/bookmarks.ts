import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { Liked } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const bookmarkRouter = createTRPCRouter({
  bookmarksByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = input.userId;
      const bookmarked = await ctx.prisma.bookmark.findMany({
        where: {
          userId: userId!,
        },
        include: {
          post: {
            include: {
              comments: true,
              user: true,
              liked: true,
              _count: {
                select: {
                  Bookmark: true,
                },
              },
            },
          },
        },
      });

      return bookmarked;
    }),
  create: privateProcedure
    .input(
      z.object({
        postId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { success } = await rateLimiter.limit(userId);

      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }
      const bookmark = await ctx.prisma.bookmark.create({
        data: {
          userId,
          postId: input.postId,
        },
      });

      return bookmark;
    }),
  delete: privateProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const bookmark = await ctx.prisma.bookmark.findFirst({
        where: {
          postId: input.postId,
          userId,
        },
      });

      if (!bookmark) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Like not found",
        });
      }

      await ctx.prisma.bookmark.delete({
        where: {
          id: bookmark.id,
        },
      });

      return { success: true };
    }),
});
