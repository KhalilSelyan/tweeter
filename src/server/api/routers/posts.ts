import type { User } from "@clerk/nextjs/dist/api";
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
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    {
      const author = users.find((user) => user.id === post.authorId);
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

export const postsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.id,
        },
        select: {
          _count: {
            select: {
              comments: true,
              liked: true,
            },
          },

          id: true,
          content: true,
          image: true,
          createdAt: true,
          authorId: true,
          comments: {
            take: 2,
            // skip: page * 2,
            select: {
              id: true,
              content: true,
              image: true,
              createdAt: true,
              authorId: true,
            },
          },
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Post not found",
        });
      }

      const author = await clerkClient.users.getUser(post.authorId);
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
      select: {
        _count: {
          select: {
            comments: true,
            liked: true,
          },
        },
        user: false,
        id: true,
        content: true,
        image: true,
        createdAt: true,
        authorId: true,
        comments: {
          take: 2,
          // skip: page * 2,
          select: {
            id: true,
            content: true,
            image: true,
            createdAt: true,
            authorId: true,
          },
        },
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
            authorId: input.userId,
          },
          take: 100,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            _count: {
              select: {
                comments: true,
                liked: true,
              },
            },
            id: true,
            content: true,
            image: true,
            createdAt: true,
            authorId: true,
            comments: true,
            user: true,
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;
      const { success } = await rateLimiter.limit(authorId);

      if (!success) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
          image: input.image ?? "",
        },
      });

      return post;
    }),
});
