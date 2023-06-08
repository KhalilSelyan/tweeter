/* eslint-disable @next/next/no-img-element */
import { useUser } from "@clerk/nextjs";
import { Comment } from "@prisma/client";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsBookmark } from "react-icons/bs";
import { IoImageOutline } from "react-icons/io5";
import { MdOutlineModeComment } from "react-icons/md";
import { TbRefresh } from "react-icons/tb";
import { Web3Storage } from "web3.storage";
import { env } from "~/env.mjs";
import { api, type RouterOutputs } from "~/utils/api";

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  const { user } = useUser();
  const commentRef = useRef<HTMLInputElement>(null);

  const updateUserName = async (username: string) => {
    if (!user) return;
    await user.update({
      username,
    });
  };

  // console.log(post);
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.comment.create.useMutation({
    onSuccess: () => {
      if (!commentRef.current) return;
      commentRef.current.value = "";
      setFile(null);
      setIpfsUrl("");
      void ctx.posts.invalidate();
    },
    onError: (err) => {
      const error = err.data?.zodError?.fieldErrors.content;
      if (error && error[0]) toast.error(error[0]);
      else toast.error("Something went wrong, please try again later");
    },
  });

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState("");
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    } else if (event.target.files[0] !== undefined) {
      setFile(event.target.files[0]);
      setTimeout(() => {
        submitButtonRef.current?.click();
      }, 250);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      return;
    }

    setUploading(true);

    const client = new Web3Storage({
      token: env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY,
    });
    const cid = await client.put([file]);
    const url = `https://${cid}.ipfs.w3s.link/${file.name}`;

    setIpfsUrl(url);
    setUploading(false);
  };

  return (
    <div className="flex flex-col justify-center gap-y-2 rounded-xl border-2 border-gray-200 bg-white">
      <div className="flex items-center gap-x-2 p-4">
        <Link href={`/@${author.username}`}>
          <Image
            src={author.profileImageUrl}
            alt=""
            className="h-10 w-10 rounded-xl"
            width={40}
            height={40}
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
        <span>{post._count.liked ?? 0} likes</span>
        <span>{post._count.comments} comments</span>
        <span>0 bookmarks</span>
      </div>
      <hr />
      {/* icons container */}
      <div className="flex items-center p-2">
        <div className="flex h-10 grow cursor-pointer items-center justify-center rounded-xl hover:bg-gray-100">
          <MdOutlineModeComment className="h-5 w-5" />
        </div>
        <div className="flex h-10 grow cursor-pointer items-center justify-center rounded-xl hover:bg-gray-100">
          <TbRefresh className="h-5 w-5" />
        </div>
        <div className="flex h-10 grow cursor-pointer items-center justify-center rounded-xl hover:bg-gray-100">
          <AiOutlineHeart className="h-5 w-5" />
        </div>
        <div className="flex h-10 grow cursor-pointer items-center justify-center rounded-xl hover:bg-gray-100">
          <BsBookmark className="h-5 w-5" />
        </div>
      </div>
      {/* end icons container */}

      {/* reply zone */}
      <div className="flex gap-x-2 rounded-xl px-2 py-2">
        <Image
          src={user ? user.profileImageUrl : ""}
          alt=""
          className="h-10 w-10 rounded-xl"
          width={40}
          height={40}
        />
        <div className="flex w-full items-center rounded-xl border border-slate-200 bg-slate-100 p-2">
          <form
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              mutate({
                postId: post.id,
                content: commentRef.current?.value || "",
                image: ipfsUrl,
                userId: user?.id || "",
              });
            }}
          >
            <input
              ref={commentRef}
              type="text"
              placeholder={`Reply to @${author.username}`}
              className="w-full border-none bg-transparent text-slate-400 outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.shiftKey) {
                  e.preventDefault();
                }
              }}
            />
          </form>
          {ipfsUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ipfsUrl} alt="" className="aspect-auto h-52 rounded-xl" />
          )}
          <hr className="my-4" />
          <div className="flex justify-between text-[#2F80ED]">
            <div className="flex items-center gap-x-2 text-xs font-semibold">
              <form
                className="relative flex items-center gap-x-2"
                onSubmit={handleSubmit}
              >
                <label
                  title="Click to upload"
                  htmlFor="button23"
                  className="cursor-pointer items-center"
                >
                  <IoImageOutline className="relative h-6 w-6" />
                </label>
                <input
                  hidden
                  type="file"
                  name="button23"
                  id="button23"
                  onChange={handleChange}
                />
                <button
                  ref={submitButtonRef}
                  type="submit"
                  className="focus:shadow-outline hidden rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none disabled:bg-gray-400"
                  disabled={!file || uploading}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </form>{" "}
            </div>
          </div>
        </div>
      </div>
      {/* Comment Zone */}
      {/* dev */}
      {/* <div className="flex flex-col p-2">
        <div className="flex gap-x-2 rounded-xl">
          <img
            src="/tweeter-small.svg"
            alt="Picture of the commenter"
            className="h-10 w-10 rounded-xl border-2 object-scale-down "
          />
          <div className="flex w-full flex-col gap-y-4 rounded-xl bg-slate-100 p-2 text-sm">
            <div className="flex flex-col gap-y-2 font-semibold md:flex-row md:gap-x-2">
              <span>@khalilselyan</span>
              <span className="font-light text-slate-400">
                {format(new Date(), "d MMMM")} at {format(new Date(), "HH:mm")}
              </span>
            </div>
            <div>
              <span>Meowww</span>
            </div>
          </div>
        </div>
        <span className="ml-14 mt-2 flex cursor-pointer items-center gap-x-1 p-1 text-sm font-light text-slate-400">
          <AiOutlineHeart className="text-lg hover:text-red-500" /> 12likes
          <AiFillHeart className="text-lg hover:text-red-500" />
        </span>
      </div> */}
      {/* end dev */}
      {post.comments.map((comment: Comment) => {
        return (
          <div className="flex flex-col p-2" key={comment.id}>
            <div className="flex gap-x-2 rounded-xl">
              {/* @ts-ignore */}
              <img
                src={comment.user.profileImage}
                alt="Picture of the commenter"
                className="h-10 w-10 rounded-xl"
              />
              <div className="flex w-full flex-col gap-y-4 rounded-xl bg-slate-100 p-2 text-sm">
                <div className="flex flex-col gap-y-2 font-semibold md:flex-row md:gap-x-2">
                  <Link href={`/@${comment.user.username}`}>
                    <span>@{comment.user.username}</span>
                  </Link>
                  <span className="font-light text-slate-400">
                    {format(comment.createdAt, "d MMMM")} at{" "}
                    {format(comment.createdAt, "HH:mm")}
                  </span>
                </div>
                <div>
                  <span>{comment.content}</span>
                  {comment.image !== "" && (
                    <img
                      src={comment.image}
                      className="aspect-auto h-48 rounded-xl object-cover"
                      alt=""
                    />
                  )}
                </div>
              </div>
            </div>
            <span className="ml-14 mt-2 flex cursor-pointer items-center gap-x-1 p-1 text-sm font-light text-slate-400">
              <AiOutlineHeart className="text-lg hover:text-red-500" />{" "}
              {/* {comment._count.liked ?? 0} */}
              0likes
              {/* <AiFillHeart className="text-lg hover:text-red-500" /> */}
            </span>
          </div>
        );
      })}
      {/* End comment zone */}
    </div>
  );
};
