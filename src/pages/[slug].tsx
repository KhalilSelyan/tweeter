/* eslint-disable @next/next/no-img-element */
import { useUser } from "@clerk/nextjs";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { api } from "~/utils/api";
import NavButtons from "~/components/navbuttons";
import { IoPersonAddSharp } from "react-icons/io5";
import { useState } from "react";
import { TbRefresh } from "react-icons/tb";
import Head from "next/head";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import LoadingSpinner from "~/components/loading";
import { PostView } from "~/components/postview";

const ProfileFeed = (props: { userId: string }) => {
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
            <div className="text-center text-lg text-gray-500">
              Photographer & Filmmaker based in Copenhagen, Denmark ✵ 🇩🇰
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

          <div className="flex items-center p-4 text-sm ">
            <TbRefresh className="mr-1 text-gray-500" />
            <div className="text-center text-gray-500">
              {user?.fullName} retweeted
            </div>
          </div>
        </div>
        <div className="px-4">
          <ProfileFeed userId={data.id} />
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
