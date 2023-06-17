/* eslint-disable @next/next/no-img-element */
import { useUser } from "@clerk/nextjs";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { api } from "~/utils/api";
import NavButtons from "~/components/navbuttons";
import {
  IoImageOutline,
  IoPersonAddSharp,
  IoPersonRemoveSharp,
} from "react-icons/io5";
import { useRef, useState } from "react";
import { TbRefresh } from "react-icons/tb";
import Head from "next/head";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import LoadingSpinner from "~/components/loading";
import { PostView } from "~/components/postview";
import { AiFillEdit } from "react-icons/ai";
import { toast } from "react-hot-toast";
import FollowCard from "~/components/followCard";
import { useAtom } from "jotai";
import { typeAtom } from "~/jotai";
import { Web3Storage } from "web3.storage";
import { env } from "~/env.mjs";

const ProfileFeed = (props: { userId: string; feedType: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!data || data.length === 0) return <div>No posts here...</div>;

  return (
    <div className="flex flex-col gap-y-2 pb-20">
      {data.map(({ post, author }) => (
        <PostView key={post.id} post={post} author={author} />
      ))}
    </div>
  );
};

const Home: NextPage<{
  userName: string;
}> = ({ userName }) => {
  const { isLoaded: userLoaded, user } = useUser();

  const [selectedTab, setSelectedTab] = useState<
    "tweets" | "replies" | "media" | "likes"
  >("tweets");

  const { data } = api.profile.getUserByUserName.useQuery({
    userName,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileImageOpen, setIsProfileImageOpen] = useState(false);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const ctx = api.useContext();
  const { mutate } = api.profile.updateBio.useMutation({
    onSuccess: () => {
      if (!bioRef.current) return;
      bioRef.current.value = "";
      setIsOpen(false);
      void ctx.profile.getUserByUserName.invalidate();
    },
    onError: (err) => {
      const error = err.data?.zodError?.fieldErrors.content;
      if (error && error[0]) toast.error(error[0]);
      else toast.error("Something went wrong, please try again later");
    },
  });

  const { mutate: addFollow } = api.follow.create.useMutation({
    onSuccess: () => {
      void ctx.follow.invalidate();
    },
    onError: (err) => {
      const error = err.data?.zodError?.fieldErrors.content;
      if (error && error[0]) toast.error(error[0]);
      else toast.error("Something went wrong, please try again later");
      void ctx.follow.invalidate();
    },
  });
  const { mutate: removeFollow } = api.follow.delete.useMutation({
    onSuccess: () => {
      void ctx.follow.invalidate();
    },
    onError: (err) => {
      const error = err.data?.zodError?.fieldErrors.content;
      if (error && error[0]) toast.error(error[0]);
      else toast.error("Something went wrong, please try again later");
      void ctx.follow.invalidate();
    },
  });

  const { data: following } = api.follow.followsByUserId.useQuery({
    userId: data!.id,
  });

  const { data: followedBy } = api.follow.userIdFollowedBy.useQuery({
    userId: data!.id,
  });

  const followedByIds = followedBy?.map((v) => v.followerId);

  const { mutate: updateProfileImage } =
    api.profile.updateProfilePicture.useMutation({
      onSuccess: () => {
        void ctx.profile.getUserByUserName.invalidate();
      },
      onError: (err) => {
        const error = err.data?.zodError?.fieldErrors.content;
        if (error && error[0]) toast.error(error[0]);
        else toast.error("Something went wrong, please try again later");
        void ctx.profile.getUserByUserName.invalidate();
      },
    });

  const [type, setType] = useAtom(typeAtom);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState("");
  const submitButtonReff = useRef<HTMLButtonElement>(null);

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

  if (!data) return <div>Something went wrong...</div>;

  if (!userLoaded || !user) return <div />;

  return (
    <>
      <Head>
        <title>@{data.username} | Profile </title>
      </Head>
      <main className="relative mx-auto flex h-full max-w-screen-lg flex-col">
        {type.enabled && (
          <div className="absolute z-50 w-full md:top-1/3 md:translate-x-1/3">
            <FollowCard
              type={type.type}
              profileId={data.id}
              userId={user!.id}
            />
          </div>
        )}
        <div className="flex flex-col border-slate-400">
          <img
            src="https://i.pinimg.com/originals/4d/d5/85/4dd585d3e8a1a6b23f9a54e5a1076c8b.jpg"
            alt="Picture of the author"
            className="h-56 w-full object-cover md:h-[28rem]"
          />
          <dialog
            open={isProfileImageOpen}
            role="dialog"
            className="fixed inset-0 z-20 overflow-y-auto bg-transparent"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <div className="flex items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:h-screen sm:align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div
                className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <form
                  className="flex w-full items-center justify-center gap-x-2 p-4"
                  onSubmit={handleSubmit}
                >
                  <label
                    title="Click to upload"
                    htmlFor="button2333"
                    className="flex cursor-pointer items-center gap-x-2"
                  >
                    Upload Image
                    <IoImageOutline className="h-6 w-6" />
                  </label>
                  <input
                    hidden
                    type="file"
                    name="button2333"
                    id="button2333"
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
                <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    disabled={!ipfsUrl}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      updateProfileImage({
                        id: data.id,
                        profilePicture: ipfsUrl,
                      });
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setIsProfileImageOpen(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </dialog>

          {/* profile box */}
          <div className="relative mx-4 -mt-4 flex h-64 flex-col items-center justify-center gap-y-2 rounded-xl bg-white pt-16 md:mx-0 md:h-80 md:pt-32">
            <AiFillEdit
              onClick={() => {
                setIsProfileImageOpen(true);
              }}
              className="absolute -top-16 right-28 z-10 mr-2 mt-2 h-6 w-6 cursor-pointer rounded-md bg-black p-1 text-white md:-top-32 md:right-96 md:h-6 md:w-6 "
            />
            <img
              src={data.profileImageUrl}
              alt="Picture of the author"
              className="absolute -top-16 left-0 right-0 m-auto aspect-square h-32 w-32 rounded-xl border-2 border-white object-cover md:-top-32  md:h-64 md:w-64"
            />
            <div className="flex flex-col items-center">
              <h1 className="text-2xl font-bold">{data.name}</h1>
              <h1 className="text-sm font-medium text-gray-400">
                @{data.username}
              </h1>
            </div>
            <div className="flex w-full justify-evenly">
              <div
                onClick={() => {
                  setType({
                    enabled: true,
                    type: "following",
                  });
                }}
                className="flex cursor-pointer gap-x-1 text-sm text-gray-500 hover:text-blue-500 hover:underline"
              >
                <span className="font-bold text-black hover:text-blue-500">
                  {String(following?.length) ?? 0}
                </span>{" "}
                Following
              </div>
              <div
                onClick={() => {
                  setType({
                    enabled: true,
                    type: "follower",
                  });
                }}
                className="flex cursor-pointer gap-x-1 text-sm text-gray-500 hover:text-blue-500 hover:underline"
              >
                <span className="font-bold text-black hover:text-blue-500">
                  {" "}
                  {String(followedBy?.length) ?? 0}
                </span>
                Followers
              </div>
            </div>
            {user.id === data.id && (
              <>
                <AiFillEdit
                  onClick={() => {
                    setIsOpen(true);
                  }}
                />
                <dialog
                  open={isOpen}
                  role="dialog"
                  className="fixed inset-0 z-10 overflow-y-auto bg-transparent"
                  aria-labelledby="modal-title"
                  aria-describedby="modal-description"
                >
                  <div className="flex items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
                    <div
                      className="fixed inset-0 transition-opacity"
                      aria-hidden="true"
                    >
                      <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    <span
                      className="hidden sm:inline-block sm:h-screen sm:align-middle"
                      aria-hidden="true"
                    >
                      &#8203;
                    </span>
                    <div
                      className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="modal-headline"
                    >
                      <div className="flex flex-col p-6 md:h-72 md:w-96">
                        <div className="flex w-full sm:items-start md:items-center">
                          <div className="flex w-full flex-col gap-y-2 px-2 text-left md:mt-3 md:text-center">
                            <h3
                              className="text-lg font-medium leading-6 text-gray-900"
                              id="modal-headline"
                            >
                              Edit Bio
                            </h3>
                            {/* <div className="mt-2"> */}
                            <textarea
                              ref={bioRef}
                              className="flex w-full resize-none flex-col items-center  rounded-md border border-gray-300 px-4 pt-4 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 md:h-48"
                              placeholder="Bio"
                              defaultValue={data.bio?.bio}
                            />
                            {/* </div> */}
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                          type="button"
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                          onClick={() => {
                            if (!bioRef.current) return;
                            mutate({
                              id: data.id,
                              bio: bioRef.current.value,
                            });
                          }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
                          onClick={() => {
                            setIsOpen(false);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </dialog>
              </>
            )}
            <div className="text-center text-lg text-gray-500">
              {data.bio?.bio || "No bio"}
            </div>
            {user.id !== data.id && (
              <div
                onClick={() => {
                  if (!followedByIds?.includes(user.id)) {
                    addFollow({
                      followedUserId: data.id,
                    });
                  } else {
                    removeFollow({
                      followedUserId: data.id,
                    });
                  }
                }}
                className="flex cursor-pointer items-center rounded-md bg-blue-500 px-4 py-1 text-sm text-white"
              >
                {!followedByIds?.includes(user.id) ? (
                  <>
                    <IoPersonAddSharp className="mr-2 inline-block" />
                    <div>Follow</div>
                  </>
                ) : (
                  <>
                    <IoPersonRemoveSharp className="mr-2 inline-block" />
                    <div>Unfollow</div>
                  </>
                )}
              </div>
            )}
          </div>
          {/* end profile box */}

          {/* tweets/replies/media/likes */}

          {/* <ul className="mx-4 mt-4 flex flex-col rounded-xl bg-white">
            <li
              className={`relative flex-1 px-6 py-4 text-sm font-medium text-gray-500 ${
                selectedTab === "tweets" && "text-blue-500"
              } `}
              onClick={() => setSelectedTab("tweets")}
            >
              <div
                className={`absolute left-0 h-1/2 w-1 rounded-r-xl ${
                  selectedTab === "tweets" ? "bg-blue-500" : "hidden"
                } `}
              ></div>
              Tweets
            </li>
            <li
              className={`relative flex-1 px-6 py-4 text-sm font-medium text-gray-500 ${
                selectedTab === "replies" && "text-blue-500"
              } `}
              onClick={() => setSelectedTab("replies")}
            >
              <div
                className={`absolute left-0 h-1/2 w-1 rounded-r-xl ${
                  selectedTab === "replies" ? "bg-blue-500" : "hidden"
                } `}
              ></div>
              Tweets & replies
            </li>
            <li
              className={`relative flex-1 px-6 py-4 text-sm font-medium text-gray-500 ${
                selectedTab === "media" && "text-blue-500"
              } `}
              onClick={() => setSelectedTab("media")}
            >
              <div
                className={`absolute left-0 h-1/2 w-1 rounded-r-xl ${
                  selectedTab === "media" ? "bg-blue-500" : "hidden"
                } `}
              ></div>
              Media
            </li>
            <li
              className={`relative flex-1 px-6 py-4 text-sm font-medium text-gray-500 ${
                selectedTab === "likes" && "text-blue-500"
              } `}
              onClick={() => setSelectedTab("likes")}
            >
              <div
                className={`absolute left-0 h-1/2 w-1 rounded-r-xl ${
                  selectedTab === "likes" ? "bg-blue-500" : "hidden"
                } `}
              ></div>
              Likes
            </li>
          </ul> */}
          {/* end tweets/replies/media/likes */}
        </div>
        <div className="px-4 py-2">
          <ProfileFeed feedType={selectedTab} userId={data.id} />
        </div>

        {/* push all the way down and keep there even on scroll */}
        <div className="fixed bottom-0 left-0 w-full md:hidden">
          <NavButtons />
        </div>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const userName = slug.replace("@", "");

  await ssg.profile.getUserByUserName.prefetch({
    userName,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      userName,
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default Home;
