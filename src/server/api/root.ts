import { createTRPCRouter } from "~/server/api/trpc";
import { postsRouter } from "./routers/posts";
import { profileRouter } from "./routers/profile";
import { commentsRouter } from "./routers/comments";
import { likesRouter } from "./routers/likes";
import { userRouter } from "./routers/user";
import { bookmarkRouter } from "./routers/bookmarks";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  posts: postsRouter,
  profile: profileRouter,
  comment: commentsRouter,
  likes: likesRouter,
  users: userRouter,
  bookmark: bookmarkRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
