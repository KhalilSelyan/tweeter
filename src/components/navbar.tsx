import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
  const userData = useUser();
  const profilePicture = userData.user?.profileImageUrl;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div
      className={`fixed left-0 top-0 z-10 flex h-14 w-full items-center justify-between bg-white px-4 pt-2`}
    >
      <div className="pb-2">
        <Link href="/">
          <Image
            src="/tweeter.svg"
            alt="Tweeter logo"
            height={64}
            width={64}
            className="aspect-square h-16 w-16 rounded-xl"
          />
        </Link>
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
      </div>

      <div className="hidden h-full items-center gap-x-4 md:flex">
        <div className="relative flex h-full flex-col justify-center">
          <div>Home</div>
          <div className="absolute bottom-0 h-1 w-full rounded-t-xl bg-blue-500"></div>
        </div>
        <div className="relative flex h-full flex-col justify-center">
          <div>Bookmark</div>
          <div className="  absolute bottom-0 hidden h-1 w-full rounded-t-xl bg-blue-500"></div>
        </div>
        {/* <div className="bg-slate-100"></div> */}
      </div>
      {!userData.isSignedIn ? (
        <SignInButton>
          <button className="rounded-md bg-[#2e026d] px-4 pb-4 pt-2 text-white">
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
            <Image
              priority
              src={profilePicture ?? "/tweeter-small.svg"}
              alt="Tweeter logo"
              height={32}
              width={32}
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
