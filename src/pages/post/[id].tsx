import { useUser } from "@clerk/nextjs";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { api } from "~/utils/api";
import NavButtons from "~/components/navbuttons";
import Head from "next/head";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import LoadingSpinner from "~/components/loading";
import { PostView } from "~/components/postview";

const Post: NextPage<{
  id: string;
}> = ({ id }) => {
  const { data, isLoading } = api.posts.getById.useQuery({
    id,
  });
  const { isLoaded: userLoaded, user } = useUser();

  if (!data) return <div>Something went wrong...</div>;

  if (!userLoaded || !user) return <div />;

  if (isLoading) return <LoadingSpinner />;
  if (!data) return <div>No posts here...</div>;

  return (
    <>
      <Head>
        <title>@{data.author.username} | Post </title>
      </Head>
      <main className="mx-auto flex max-w-screen-lg flex-col pt-16">
        <div className="flex flex-col gap-y-2 pb-20">
          <PostView
            key={data.author.id}
            post={data.post}
            author={data.author}
          />
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

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");

  await ssg.posts.getById.prefetch({ id });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default Post;
