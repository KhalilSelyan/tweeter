import { useUser } from "@clerk/nextjs";
import React from "react";
import { BiWorld } from "react-icons/bi";
import { IoImageOutline } from "react-icons/io5";

const Twitbox = () => {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-4">
      {/* tweet box */}

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
            placeholder="What's happening?"
            className="bg-transparent px-4 text-black outline-none"
          />
        </form>
      </div>
      <hr className="my-4" />
      <div className="flex justify-between text-[#2F80ED]">
        <div className="flex items-center gap-x-2 text-xs font-semibold">
          <IoImageOutline className="h-6 w-6 " />
          <BiWorld className="h-6 w-6 " />
          <span>Everyone can reply</span>
        </div>
        <button className="rounded-md bg-[#2F80ED] px-6 py-2 text-xs text-white">
          Tweet
        </button>
      </div>
      {/* end tweet box */}
    </div>
  );
};

export default Twitbox;
