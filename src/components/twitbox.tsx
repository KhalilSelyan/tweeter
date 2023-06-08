import { useUser } from "@clerk/nextjs";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { BiWorld } from "react-icons/bi";
import { IoImageOutline } from "react-icons/io5";
import { api } from "~/utils/api";
import { Web3Storage } from "web3.storage";
import { env } from "~/env.mjs";

const Twitbox = () => {
  const { user } = useUser();
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      if (!textAreaRef.current) return;
      textAreaRef.current.value = "";
      setFile(null);
      setIpfsUrl("");
      void ctx.posts.getAll.invalidate();
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
  const submitButtonReff = React.useRef<HTMLButtonElement>(null);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    } else if (event.target.files[0] !== undefined) {
      setFile(event.target.files[0]);
      setTimeout(() => {
        submitButtonReff.current?.click();
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

  console.log(ipfsUrl);

  if (!user) return null;
  return (
    <div
      className={` ${
        isPosting && "opacity-30"
      } rounded-xl border-2 border-gray-200 bg-white p-4`}
    >
      {/* tweet box */}

      {/* <Upload /> */}
      <span className="font-semibold text-black">Tweet Something</span>
      <hr className="my-4" />
      <div className="flex">
        <img
          src={user.profileImageUrl}
          alt=""
          className="h-10 w-10 rounded-xl"
        />
        <form className="flex flex-1">
          <textarea
            disabled={isPosting}
            ref={textAreaRef}
            placeholder="What's happening?"
            className="h-32 w-full resize-none bg-transparent px-4 text-black outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!textAreaRef.current) return;
                mutate({
                  content: textAreaRef.current?.value,
                  image: ipfsUrl,
                });
              }
            }}
          />
        </form>
      </div>
      {ipfsUrl && (
        <img src={ipfsUrl} alt="" className="aspect-auto w-full rounded-xl" />
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
              htmlFor="button2"
              className="cursor-pointer items-center"
            >
              <IoImageOutline className="relative h-6 w-6" />
            </label>
            <input
              hidden
              type="file"
              name="button2"
              id="button2"
              onChange={handleChange}
            />
            <button
              ref={submitButtonReff}
              type="submit"
              className="focus:shadow-outline hidden rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none disabled:bg-gray-400"
              disabled={!file || uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
          <BiWorld className="h-6 w-6 " />
          <span>Everyone can reply</span>
        </div>
        <button
          onClick={() => {
            if (!textAreaRef.current) return;
            mutate({
              content: textAreaRef.current?.value,
              image: ipfsUrl,
            });
          }}
          className="rounded-md bg-[#2F80ED] px-6 py-2 text-xs text-white"
        >
          Tweet
        </button>
      </div>
      {/* end tweet box */}
    </div>
  );
};

export default Twitbox;
