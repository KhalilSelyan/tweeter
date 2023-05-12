import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Navbar from "~/components/navbar";
import Head from "next/head";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>TwitClone</title>
        <meta name="description" content="A clone of Twitter" />
        <link rel="icon" href="/tweeter-small.svg" />
      </Head>
      <Toaster position="bottom-center" />
      <Navbar />
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
