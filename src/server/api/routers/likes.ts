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

import { filterUserForClient } from "~/server/helpers/filterUserForClient";

const addUserDataToLikes = async (likes: Liked[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: likes.map((like) => like.userId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return likes.map((like) => {
    {
      const user = users.find((user) => user.id === like.userId);
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }
      return {
        like,
        user: {
          ...user,
          username: user.username,
        },
      };
    }
  });
};

const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(25, "1 m"),
  analytics: true,
});

export const likesRouter = createTRPCRouter({
  likesByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = input.userId;
      const liked = await ctx.prisma.liked.findMany({
        where: {
          userId: userId!,
        },
        select: {
          postId: true,
          commentId: true,
        },
      });

      const postIdArray = liked.map((value) => {
        return value.postId;
      });

      const commentIdArray = liked.map((value) => {
        return value.commentId;
      });

      return {
        postIdArray,
        commentIdArray,
      };
    }),
  create: privateProcedure
    .input(
      z.object({
        postId: z.string().optional(),
        commentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { success } = await rateLimiter.limit(userId);

      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }
      const like = await ctx.prisma.liked.create({
        data: {
          userId,
          postId: input.postId,
          commentId: input.commentId,
        },
      });

      return like;
    }),
  delete: privateProcedure
    .input(
      z.object({
        postId: z.string().optional(),
        commentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      if (!input.commentId) {
        const like = await ctx.prisma.liked.findFirst({
          where: {
            postId: input.postId,
            userId,
          },
        });

        if (!like) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Like not found",
          });
        }

        await ctx.prisma.liked.delete({
          where: {
            id: like.id,
          },
        });
      } else if (!input.postId) {
        const like = await ctx.prisma.liked.findFirst({
          where: {
            commentId: input.commentId,
            userId,
          },
        });

        if (!like) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Like not found",
          });
        }

        await ctx.prisma.liked.delete({
          where: {
            id: like.id,
          },
        });
      }

      return { success: true };
    }),
});
