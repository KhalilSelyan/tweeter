import { useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { RouterOutputs, api } from "~/utils/api";
import Twitbox from "~/components/twitbox";
import { format } from "date-fns";
import { MdOutlineModeComment } from "react-icons/md";
import { TbRefresh } from "react-icons/tb";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { BsBookmark, BsFillBookmarkFill } from "react-icons/bs";
import { IoImageOutline } from "react-icons/io5";
import LoadingSpinner from "~/components/loading";
import NavButtons from "~/components/navbuttons";
import Uploader from "~/components/uploader";
import Link from "next/link";

export const Feed = () => {
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

const Home: NextPage = () => {
  const { isLoaded: userLoaded } = useUser();

  // Start fetching asap
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <main className="flex flex-col gap-y-2">
        <div className="flex flex-col gap-y-2 border-slate-400 px-4 pt-16">
          {/* <Uploader /> */}
          <Twitbox />
          <Feed />
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

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  const { user } = useUser();
  return (
    <div className="flex flex-col justify-center gap-y-2 rounded-xl border-2 border-gray-200 bg-white">
      <div className="flex items-center gap-x-2 p-4">
        <Link href={`/@${author.username}`}>
          <img
            src={author.profileImageUrl}
            alt=""
            className="h-10 w-10 rounded-xl"
          />
        </Link>
        <div className="flex flex-col text-sm ">
          <Link href={`/@${author.username}`}>
            <span>@{author.username}</span>
          </Link>
          <span className="text-slate-400">
            {format(post.createdAt, "d MMMM")} at{" "}
            {format(post.createdAt, "HH:mm")}
          </span>
        </div>
      </div>
      <span className="px-4 py-2">{post.content}</span>
      {post.image && (
        <img src={post.image} alt="" className="rounded-xl" width="100%" />
      )}
      <div className="flex items-center justify-end gap-x-2 px-4 text-xs text-slate-400">
        <span>12 likes</span>
        <span>11 comments</span>
        <span>4 shares</span>
      </div>
      <hr />
      {/* icons container */}
      <div className="flex items-center p-2">
        <div className="flex h-10 grow items-center justify-center rounded-xl hover:bg-gray-100">
          <MdOutlineModeComment className="h-5 w-5" />
        </div>
        <div className="flex h-10 grow items-center justify-center rounded-xl hover:bg-gray-100">
          <TbRefresh className="h-5 w-5" />
        </div>
        <div className="flex h-10 grow items-center justify-center rounded-xl hover:bg-gray-100">
          <AiOutlineHeart className="h-5 w-5" />
        </div>
        <div className="flex h-10 grow items-center justify-center rounded-xl hover:bg-gray-100">
          <BsBookmark className="h-5 w-5" />
        </div>
      </div>
      {/* end icons container */}

      {/* reply zone */}
      <div className="flex gap-x-2 rounded-xl px-2 py-2">
        <img
          src={user ? user.profileImageUrl : ""}
          alt=""
          className="h-10 w-10 rounded-xl"
        />
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-2">
          <input
            type="text"
            placeholder="Reply to @user"
            className="w-[90%] border-none bg-transparent text-slate-400 outline-none"
          />
          <IoImageOutline className="h-5 w-5 text-slate-400" />
        </div>
      </div>
    </div>
  );
};
