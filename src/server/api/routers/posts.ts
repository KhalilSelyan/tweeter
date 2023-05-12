import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    name: user.firstName + " " + user.lastName,
    profileImageUrl: user.profileImageUrl,
  };
};

const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
    });

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
          author,
        };
      }
    });
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