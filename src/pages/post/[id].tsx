import { useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import NavButtons from "~/components/navbuttons";
import Head from "next/head";

const Home: NextPage = () => {
  const { isLoaded: userLoaded } = useUser();

  // Start fetching asap
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Post / TwitClone</title>
      </Head>
      <main className="flex flex-col gap-y-2">
        <div className="flex flex-col gap-y-2 border-slate-400 px-4 pt-16">
          <div>Post View</div>
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
