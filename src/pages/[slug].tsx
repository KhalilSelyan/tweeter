/* eslint-disable @next/next/no-img-element */
import { useUser } from "@clerk/nextjs";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { api } from "~/utils/api";
import NavButtons from "~/components/navbuttons";
import { IoPersonAddSharp } from "react-icons/io5";
import { useRef, useState } from "react";
import { TbRefresh } from "react-icons/tb";
import Head from "next/head";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import LoadingSpinner from "~/components/loading";
import { PostView } from "~/components/postview";
import { AiFillEdit } from "react-icons/ai";
import { toast } from "react-hot-toast";

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

  if (!data) return <div>Something went wrong...</div>;

  if (!userLoaded || !user) return <div />;

  return (
    <>
      <Head>
        <title>@{data.username} | Profile </title>
      </Head>
      <main className="flex flex-col">
        <div className="flex flex-col border-slate-400 pt-16">
          <img
            src="https://i.pinimg.com/originals/4d/d5/85/4dd585d3e8a1a6b23f9a54e5a1076c8b.jpg"
            alt="Picture of the author"
            className=" h-44 w-full object-cover md:h-96"
          />

          {/* profile box */}
          <div className="relative mx-4 -mt-4 flex h-64 flex-col items-center justify-center gap-y-2 rounded-xl bg-white pt-16">
            <img
              src={data.profileImageUrl}
              alt="Picture of the author"
              className="absolute -top-16 left-0 right-0 m-auto aspect-square h-32 w-32 rounded-xl border-2 border-white object-cover  md:h-96"
            />
            <div className="flex flex-col items-center">
              <h1 className="text-2xl font-bold">{data.name}</h1>
              <h1 className="text-sm font-medium text-gray-400">
                @{data.username}
              </h1>
            </div>
            <div className="flex w-full justify-evenly">
              <div className="flex gap-x-1 text-sm text-gray-500">
                <span className="font-bold text-black">2,569</span>Following
              </div>
              <div className="flex gap-x-1 text-sm text-gray-500">
                <span className="font-bold text-black">10.8k</span>Followers
              </div>
            </div>
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
                  <div className=" px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <h3
                          className="text-lg font-medium leading-6 text-gray-900"
                          id="modal-headline"
                        >
                          Edit Bio
                        </h3>
                        <div className="mt-2">
                          <textarea
                            ref={bioRef}
                            className="block w-full rounded-md border border-gray-300 shadow-sm outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Bio"
                            defaultValue={data.bio?.bio}
                          ></textarea>
                        </div>
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
            <div className="text-center text-lg text-gray-500">
              {data.bio?.bio || "Add Bio"}
            </div>
            <div className="flex items-center rounded-md bg-blue-500 px-4 py-1 text-sm text-white">
              <IoPersonAddSharp className="mr-2 inline-block" />
              <div>Follow</div>
            </div>
          </div>
          {/* end profile box */}

          {/* tweets/replies/media/likes */}

          <ul className="mx-4 mt-4 flex flex-col rounded-xl bg-white">
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
          </ul>
          {/* end tweets/replies/media/likes */}

          {/* <div className="flex items-center p-4 text-sm ">
            <TbRefresh className="mr-1 text-gray-500" />
            <div className="text-center text-gray-500">
              {user?.fullName} retweeted
            </div>
          </div> */}
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
