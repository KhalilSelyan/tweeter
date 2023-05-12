import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import Link from "next/link";
import { AiOutlineHeart } from "react-icons/ai";
import { BsBookmark } from "react-icons/bs";
import { IoImageOutline } from "react-icons/io5";
import { MdOutlineModeComment } from "react-icons/md";
import { TbRefresh } from "react-icons/tb";
import type { RouterOutputs } from "~/utils/api";

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
          <Link href={`/post/${post.id}`}>
            <span className="text-slate-400">
              {format(post.createdAt, "d MMMM")} at{" "}
              {format(post.createdAt, "HH:mm")}
            </span>
          </Link>
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
