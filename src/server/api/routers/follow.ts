import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const followRouter = createTRPCRouter({
  followsByUserId: privateProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const follows = await ctx.prisma.followerRelation.findMany({
        where: {
          followerId: input.userId,
        },
        include: {
          following: true,
        },
      });

      return follows;
    }),
  userIdFollowedBy: privateProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const followers = await ctx.prisma.followerRelation.findMany({
        where: {
          followingId: input.userId,
        },
        include: {
          follower: true,
        },
      });

      return followers;
    }),
  create: privateProcedure
    .input(
      z.object({
        followedUserId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { success } = await rateLimiter.limit(userId);

      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }

      const follow = await ctx.prisma.followerRelation.create({
        data: {
          followerId: userId,
          followingId: input.followedUserId,
        },
      });

      return follow;
    }),
  delete: privateProcedure
    .input(
      z.object({
        followedUserId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const follow = await ctx.prisma.followerRelation.findFirst({
        where: {
          AND: {
            followerId: ctx.userId,
            followingId: input.followedUserId,
          },
        },
      });

      if (!follow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Follow not found",
        });
      }

      await ctx.prisma.followerRelation.delete({
        where: {
          id: follow.id,
        },
      });

      return { success: true };
    }),
});
