/* eslint-disable @next/next/no-img-element */
import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useAtom } from "jotai";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { homeAtom } from "~/jotai";

const Navbar = () => {
  const userData = useUser();
  const profilePicture = userData.user?.profileImageUrl;

  const [home, setHome] = useAtom(homeAtom);
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div
      className={`fixed left-0 top-0 z-10 flex h-14 w-full items-center justify-between bg-white px-4 pt-2`}
    >
      <div className="pb-2">
        <Link href="/">
          <svg
            className="aspect-square h-16 w-16 rounded-xl"
            width="126"
            height="30"
            viewBox="0 0 126 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M36.1752 23.5172L31.1324 14.7828C30.7713 14.1574 29.8686 14.1574 29.5075 14.7828L24.4647 23.5172C24.1036 24.1426 24.555 24.9244 25.2771 24.9244H35.3628C36.0849 24.9244 36.5363 24.1427 36.1752 23.5172ZM35.1947 12.4375C33.0281 8.6849 27.6118 8.68491 25.4452 12.4375L20.4024 21.1719C18.2359 24.9244 20.9441 29.6151 25.2771 29.6151H35.3628C39.6958 29.6151 42.404 24.9244 40.2375 21.1719L35.1947 12.4375Z"
              fill="#2F80ED"
            />
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M26.6734 23.3664L16.5616 5.85216C16.2005 5.22674 15.2978 5.22673 14.9367 5.85217L4.82479 23.3664C4.46371 23.9918 4.91507 24.7736 5.63725 24.7736H25.861C26.5832 24.7736 27.0345 23.9919 26.6734 23.3664ZM20.6238 3.50681C18.4573 -0.245762 13.0409 -0.245757 10.8744 3.50681L0.76252 21.0211C-1.40403 24.7736 1.30416 29.4644 5.63725 29.4644H25.861C30.1941 29.4644 32.9023 24.7736 30.7357 21.0211L20.6238 3.50681Z"
              fill="#2F80ED"
            />
            <path
              d="M65.3312 10.0512V12.0852H61.9832V22.6152H59.4632V12.0852H56.1152V10.0512H65.3312ZM80.3639 12.6432L77.4479 22.6152H74.7299L72.9119 15.6492L71.0939 22.6152H68.3579L65.4239 12.6432H67.9799L69.7439 20.2392L71.6519 12.6432H74.3159L76.1879 20.2212L77.9519 12.6432H80.3639ZM90.3674 17.4132C90.3674 17.7732 90.3434 18.0972 90.2954 18.3852H83.0054C83.0654 19.1052 83.3174 19.6692 83.7614 20.0772C84.2054 20.4852 84.7514 20.6892 85.3994 20.6892C86.3354 20.6892 87.0014 20.2872 87.3974 19.4832H90.1154C89.8274 20.4432 89.2754 21.2352 88.4594 21.8592C87.6434 22.4712 86.6414 22.7772 85.4534 22.7772C84.4934 22.7772 83.6294 22.5672 82.8614 22.1472C82.1054 21.7152 81.5114 21.1092 81.0794 20.3292C80.6594 19.5492 80.4494 18.6492 80.4494 17.6292C80.4494 16.5972 80.6594 15.6912 81.0794 14.9112C81.4994 14.1312 82.0874 13.5312 82.8434 13.1112C83.5994 12.6912 84.4694 12.4812 85.4534 12.4812C86.4014 12.4812 87.2474 12.6852 87.9914 13.0932C88.7474 13.5012 89.3294 14.0832 89.7374 14.8392C90.1574 15.5832 90.3674 16.4412 90.3674 17.4132ZM87.7574 16.6932C87.7454 16.0452 87.5114 15.5292 87.0554 15.1452C86.5994 14.7492 86.0414 14.5512 85.3814 14.5512C84.7574 14.5512 84.2294 14.7432 83.7974 15.1272C83.3774 15.4992 83.1194 16.0212 83.0234 16.6932H87.7574ZM100.847 17.4132C100.847 17.7732 100.823 18.0972 100.775 18.3852H93.4848C93.5448 19.1052 93.7968 19.6692 94.2408 20.0772C94.6848 20.4852 95.2308 20.6892 95.8788 20.6892C96.8148 20.6892 97.4808 20.2872 97.8768 19.4832H100.595C100.307 20.4432 99.7548 21.2352 98.9388 21.8592C98.1228 22.4712 97.1208 22.7772 95.9328 22.7772C94.9728 22.7772 94.1088 22.5672 93.3408 22.1472C92.5848 21.7152 91.9908 21.1092 91.5588 20.3292C91.1388 19.5492 90.9288 18.6492 90.9288 17.6292C90.9288 16.5972 91.1388 15.6912 91.5588 14.9112C91.9788 14.1312 92.5668 13.5312 93.3228 13.1112C94.0788 12.6912 94.9488 12.4812 95.9328 12.4812C96.8808 12.4812 97.7268 12.6852 98.4708 13.0932C99.2268 13.5012 99.8088 14.0832 100.217 14.8392C100.637 15.5832 100.847 16.4412 100.847 17.4132ZM98.2368 16.6932C98.2248 16.0452 97.9908 15.5292 97.5348 15.1452C97.0788 14.7492 96.5208 14.5512 95.8608 14.5512C95.2368 14.5512 94.7088 14.7432 94.2768 15.1272C93.8568 15.4992 93.5988 16.0212 93.5028 16.6932H98.2368ZM104.99 14.7132V19.5372C104.99 19.8732 105.068 20.1192 105.224 20.2752C105.392 20.4192 105.668 20.4912 106.052 20.4912H107.222V22.6152H105.638C103.514 22.6152 102.452 21.5832 102.452 19.5192V14.7132H101.264V12.6432H102.452V10.1772H104.99V12.6432H107.222V14.7132H104.99ZM117.675 17.4132C117.675 17.7732 117.651 18.0972 117.603 18.3852H110.313C110.373 19.1052 110.625 19.6692 111.069 20.0772C111.513 20.4852 112.059 20.6892 112.707 20.6892C113.643 20.6892 114.309 20.2872 114.705 19.4832H117.423C117.135 20.4432 116.583 21.2352 115.767 21.8592C114.951 22.4712 113.949 22.7772 112.761 22.7772C111.801 22.7772 110.937 22.5672 110.169 22.1472C109.413 21.7152 108.819 21.1092 108.387 20.3292C107.967 19.5492 107.757 18.6492 107.757 17.6292C107.757 16.5972 107.967 15.6912 108.387 14.9112C108.807 14.1312 109.395 13.5312 110.151 13.1112C110.907 12.6912 111.777 12.4812 112.761 12.4812C113.709 12.4812 114.555 12.6852 115.299 13.0932C116.055 13.5012 116.637 14.0832 117.045 14.8392C117.465 15.5832 117.675 16.4412 117.675 17.4132ZM115.065 16.6932C115.053 16.0452 114.819 15.5292 114.363 15.1452C113.907 14.7492 113.349 14.5512 112.689 14.5512C112.065 14.5512 111.537 14.7432 111.105 15.1272C110.685 15.4992 110.427 16.0212 110.331 16.6932H115.065ZM121.404 14.1912C121.728 13.6632 122.148 13.2492 122.664 12.9492C123.192 12.6492 123.792 12.4992 124.464 12.4992V15.1452H123.798C123.006 15.1452 122.406 15.3312 121.998 15.7032C121.602 16.0752 121.404 16.7232 121.404 17.6472V22.6152H118.884V12.6432H121.404V14.1912Z"
              fill="#333333"
            />
          </svg>
        </Link>
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
      </div>

      <div className="hidden h-full items-center gap-x-4 md:flex">
        <div
          onClick={() => {
            if (router.pathname !== "/") router.push("/");
            setHome("home");
          }}
          className="relative flex h-full cursor-pointer flex-col justify-center"
        >
          <div>Home</div>
          <div
            className={`absolute bottom-0 h-1 w-full rounded-t-xl bg-blue-500 
            ${router.pathname !== "/" && "hidden"}
            ${home !== "home" && "hidden"}
            `}
          ></div>
        </div>
        <div
          onClick={() => {
            if (router.pathname !== "/") router.push("/");
            setHome("explore");
          }}
          className="relative flex h-full cursor-pointer flex-col justify-center"
        >
          <div>Explore</div>
          <div
            className={`absolute bottom-0 h-1 w-full rounded-t-xl bg-blue-500 
            ${router.pathname !== "/" && "hidden"}
            ${home !== "explore" && "hidden"}
            `}
          ></div>
        </div>
        <div
          onClick={() => {
            if (router.pathname !== "/") router.push("/");
            setHome("bookmark");
          }}
          className="relative flex h-full cursor-pointer flex-col justify-center"
        >
          <div>Bookmark</div>
          <div
            className={`absolute bottom-0 h-1 w-full rounded-t-xl bg-blue-500 
            ${router.pathname !== "/" && "hidden"}
            ${home !== "bookmark" && "hidden"}
            `}
          ></div>
        </div>
      </div>
      {!userData.isSignedIn ? (
        <SignInButton>
          <button className="mb-2 rounded-md bg-blue-500 px-4 py-2 text-white">
            Sign in
          </button>
        </SignInButton>
      ) : (
        <div className="relative flex w-fit flex-col pb-2">
          <button
            id="dropdownUserAvatarButton"
            data-dropdown-toggle="dropdownAvatar"
            className="mx-3 flex rounded-full bg-gray-800 text-sm md:mr-0"
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="sr-only">Open user menu</span>
            <img
              src={profilePicture}
              alt="Tweeter logo"
              className={`aspect-square h-10 w-10 rounded-xl`}
            />
          </button>

          <div
            id="dropdownAvatar"
            className={`absolute ${
              !isDropdownOpen && "hidden"
            } right-2 top-12 z-10 w-52 divide-y divide-gray-100 rounded-lg bg-white shadow dark:divide-gray-600 dark:bg-gray-700 md:w-60`}
          >
            <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
              <div>{userData.user.fullName}</div>
              <div className="truncate font-medium">
                {userData.user.primaryEmailAddress?.emailAddress}
              </div>
            </div>
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-200"
              aria-labelledby="dropdownUserAvatarButton"
            >
              <li>
                <Link
                  onClick={() => setIsDropdownOpen(false)}
                  href={`${userData.user.username}`}
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Profile
                </Link>
              </li>
              {/* <li>
                <span
                  onClick={() => {}}
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Settings
                </span>
              </li> */}
            </ul>
            <SignOutButton>
              <div
                onClick={() => setIsDropdownOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Sign out
              </div>
            </SignOutButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
