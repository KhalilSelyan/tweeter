import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const profileRouter = createTRPCRouter({
  getUserByUserName: publicProcedure
    .input(
      z.object({
        userName: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.userName],
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const bio = await ctx.prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          bio: true,
        },
      });

      return { ...filterUserForClient(user), bio };
    }),
  updateBio: privateProcedure
    .input(
      z.object({
        id: z.string(),
        bio: z.string().max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: {
          id: input.id,
        },
        data: {
          bio: input.bio,
        },
      });
    }),
  updateProfilePicture: privateProcedure
    .input(
      z.object({
        id: z.string(),
        profilePicture: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: {
          id: input.id,
        },
        data: {
          profileImage: input.profilePicture,
        },
      });
    }),
});
