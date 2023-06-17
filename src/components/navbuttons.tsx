import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { AiFillHome } from "react-icons/ai";
import { BsBookmarkCheckFill } from "react-icons/bs";
import { FaCompass } from "react-icons/fa";
import { homeAtom } from "~/jotai";
const NavButtons = () => {
  const [home, setHome] = useAtom(homeAtom);
  const router = useRouter();
  return (
    <div className="flex items-center justify-around bg-white p-4 text-slate-400 md:hidden">
      <div
        onClick={() => {
          if (router.pathname !== "/") router.push("/");
          setHome("home");
        }}
        className={`flex h-10 grow items-center justify-center rounded-xl   ${
          home === "home" && "bg-gray-100 text-blue-500"
        } ${router.pathname === "/" && "text-slate-400"}  `}
      >
        <AiFillHome className={`h-6  w-6 `} />
      </div>
      <div
        onClick={() => {
          if (router.pathname !== "/") router.push("/");
          setHome("explore");
        }}
        className={`flex h-10 grow items-center justify-center rounded-xl  ${
          home === "explore" && "bg-gray-100 text-blue-500"
        } ${router.pathname === "/" && "text-slate-400"} `}
      >
        <FaCompass className={`h-6  w-6 `} />
      </div>
      <div
        onClick={() => {
          if (router.pathname !== "/") router.push("/");
          setHome("bookmark");
        }}
        className={`flex h-10 grow items-center justify-center rounded-xl  ${
          home === "bookmark" && "bg-gray-100 text-blue-500"
        } ${router.pathname === "/" && "text-slate-400"} `}
      >
        <BsBookmarkCheckFill className={`h-6  w-6`} />
      </div>
    </div>
  );
};

export default NavButtons;
