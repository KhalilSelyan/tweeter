import { clerkClient } from "@clerk/nextjs/server";
import { Post } from "@prisma/client";
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

const addUserDataToPosts = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.pauthorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    {
      const author = users.find((user) => user.id === post.pauthorId);
      if (!author) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }
      return {
        post,
        author: {
          ...author,
          username: author.username,
        },
      };
    }
  });
};

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

      const postIds = bookmarked.map((v) => v.postId);
      const userIds = bookmarked.map((v) => v.userId);
      const returnedPosts = await addUserDataToPosts(
        bookmarked.map((v) => v.post)
      );
      return {
        postIds,
        userIds,
        returnedPosts,
      };
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
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const bookmark = await ctx.prisma.bookmark.findFirst({
        where: {
          postId: input.postId,
          userId: input.userId,
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
