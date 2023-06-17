import { useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import Twitbox from "~/components/twitbox";
import LoadingSpinner from "~/components/loading";
import NavButtons from "~/components/navbuttons";
import Head from "next/head";
import { PostView } from "~/components/postview";
import { useAtom } from "jotai";
import { homeAtom } from "~/jotai";

export const ExploreFeed = () => {
  const { isSignedIn } = useUser();

  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading)
    return (
      <div className="absolute left-0 top-0 flex h-screen w-screen flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  if (!data)
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-400 p-4">
        Something went wrong...
      </div>
    );
  return (
    <div className="flex flex-col gap-y-2 pb-20">
      {isSignedIn &&
        data.map(({ post, author }) => (
          <PostView key={post.id} post={post} author={author} />
        ))}
    </div>
  );
};

export const BookmarkFeed = () => {
  const { isSignedIn, user } = useUser();

  const { data: bookmarks, isLoading: postsLoading } =
    api.bookmark.bookmarksByUserId.useQuery({
      userId: user!.id,
    });

  if (postsLoading)
    return (
      <div className="absolute left-0 top-0 flex h-screen w-screen flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  if (!bookmarks)
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-400 p-4">
        Something went wrong...
      </div>
    );

  return (
    <div className="flex flex-col gap-y-2 pb-20">
      {isSignedIn &&
        bookmarks.returnedPosts.map(({ post, author }) => (
          <PostView key={post.id} post={post} author={author} />
        ))}
    </div>
  );
};

export const Feed = () => {
  const { isSignedIn, user } = useUser();

  const { data: posts, isLoading: postsLoading } =
    api.posts.getPostsByFollowing.useQuery({
      userId: user!.id,
    });

  const { data: myPosts, isLoading: myPostsLoading } =
    api.posts.getPostsByUserId.useQuery({
      userId: user!.id,
    });

  if (postsLoading || myPostsLoading)
    return (
      <div className="absolute left-0 top-0 flex h-screen w-screen flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  if (!posts || !myPosts)
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-400 p-4">
        Something went wrong...
      </div>
    );

  const postsWithMyPosts = [...posts, ...myPosts];
  // Sort by createdAt
  const orderedPosts = postsWithMyPosts.sort((a, b) => {
    return (
      new Date(b.post.createdAt).getTime() -
      new Date(a.post.createdAt).getTime()
    );
  });

  return (
    <div className="flex flex-col gap-y-2 pb-20">
      {isSignedIn &&
        orderedPosts.map(({ post, author }) => (
          <PostView key={post.id} post={post} author={author} />
        ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded } = useUser();
  const [home, setHome] = useAtom(homeAtom);

  // Start fetching asap
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Home / TwitClone</title>
      </Head>
      <main className="mx-auto flex max-w-screen-lg flex-col gap-y-2">
        <div className="flex flex-col gap-y-2 border-slate-400 px-4 pt-16">
          {/* <Uploader /> */}
          <Twitbox />
          {home === "bookmark" && <BookmarkFeed />}
          {home === "home" && <Feed />}
          {home === "explore" && <ExploreFeed />}
        </div>
        {/* push all the way down and keep there even on scroll */}
        <div className="fixed bottom-0 left-0 w-full">
          <NavButtons />
        </div>
      </main>
    </>
  );
};

export default Home;
