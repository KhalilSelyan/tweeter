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
      className={`fixed left-0 top-0 flex h-14 w-full items-center justify-between bg-white px-4 py-2`}
    >
      <div>
        <Link href="/">
          <Image
            priority
            src="/tweeter-small.svg"
            alt="Tweeter logo"
            height={32}
            width={32}
            className="aspect-square h-10 w-10 rounded-xl"
          />
        </Link>
      </div>
      <SignIn
        appearance={{
          layout: {
            logoImageUrl: "/tweeter-small.svg",
            logoPlacement: "inside",
            socialButtonsVariant: "iconButton",
            socialButtonsPlacement: "bottom",
          },
        }}
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
      />

      {!userData.isSignedIn ? (
        <SignInButton>
          <button className="rounded-md bg-[#2e026d] px-4 py-2 text-white">
            Sign in
          </button>
        </SignInButton>
      ) : (
        <div className="relative flex w-fit flex-col">
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
