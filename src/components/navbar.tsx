import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";

const Navbar = () => {
  const userData = useUser();
  const profilePicture = userData.user?.profileImageUrl;

  return (
    <div
      className={`fixed left-0 top-0 flex h-14 w-full justify-between bg-white px-4 py-2`}
    >
      <div>
        <Image
          priority
          src="/tweeter-small.svg"
          alt="Tweeter logo"
          height={32}
          width={32}
          className="aspect-square h-10 w-10 rounded-xl"
        />
        <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
      </div>
      {!userData.isSignedIn ? (
        <SignInButton>
          <button className="rounded-md bg-[#2e026d] px-4 py-2 text-white">
            Sign in
          </button>
        </SignInButton>
      ) : (
        <SignOutButton>
          {/* <button className="rounded-md bg-[#2e026d] px-4 py-2 text-white">
            Sign out
          </button> */}

          <Image
            priority
            src={profilePicture ?? "/tweeter-small.svg"}
            alt="Tweeter logo"
            height={32}
            width={32}
            className={`aspect-square h-10 w-10 rounded-xl`}
          />
        </SignOutButton>
      )}
    </div>
  );
};

export default Navbar;
