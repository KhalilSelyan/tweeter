import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "../trpc";

import { z } from "zod";
import { Clerk } from "@clerk/backend";
const clerk = Clerk({ apiKey: process.env.CLERK_API_KEY });

export const userRouter = createTRPCRouter({
  // Add more routes here as needed...
});
