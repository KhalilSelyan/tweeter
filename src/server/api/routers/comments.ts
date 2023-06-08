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

export const commentsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Post not found",
        });
      }

      const author = await clerkClient.users.getUser(post.pauthorId);
      if (!author) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }

      return (await addUserDataToPosts([post]))[0];
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
    });
    return addUserDataToPosts(posts);
  }),
  getPostsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post
        .findMany({
          where: {
            pauthorId: input.userId,
          },
          take: 100,
          orderBy: {
            createdAt: "desc",
          },
        })
        .then(addUserDataToPosts);
      return posts;
    }),
  create: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .min(1, "Post must be at least 1 character long")
          .max(280, "Post must be at most 280 characters long"),
        image: z.string().optional(),
        postId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cauthorId = ctx.userId;
      const { success } = await rateLimiter.limit(cauthorId);

      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }

      const user = await ctx.prisma.user.findUnique({
        where: {
          id: cauthorId,
        },
      });

      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
      });

      if (!user || !post) return;

      const comment = await ctx.prisma.comment.create({
        data: {
          // cauthorId,
          content: input.content,
          image: input.image ?? "",
          // postId: input.postId,
          // @ts-ignore
          user: user,
          // @ts-ignore
          post: post,
        },
      });

      return comment;
    }),
});
