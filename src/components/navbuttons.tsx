import { useAtom } from "jotai";
import { AiFillHome } from "react-icons/ai";
import { BsBookmarkCheckFill } from "react-icons/bs";
import { FaCompass } from "react-icons/fa";
import { homeAtom } from "~/jotai";
const NavButtons = () => {
  const [home, setHome] = useAtom(homeAtom);
  return (
    <div className="flex items-center justify-around bg-white p-4 text-slate-400 md:hidden">
      <div
        onClick={() => setHome("home")}
        className={`flex h-10 grow items-center justify-center rounded-xl   ${
          home === "home" && "bg-gray-100 text-blue-500"
        }  `}
      >
        <AiFillHome className={`h-6  w-6 `} />
      </div>
      <div
        onClick={() => setHome("explore")}
        className={`flex h-10 grow items-center justify-center rounded-xl  ${
          home === "explore" && "bg-gray-100 text-blue-500"
        } `}
      >
        <FaCompass className={`h-6  w-6 `} />
      </div>
      <div
        onClick={() => setHome("bookmark")}
        className={`flex h-10 grow items-center justify-center rounded-xl  ${
          home === "bookmark" && "bg-gray-100 text-blue-500"
        } `}
      >
        <BsBookmarkCheckFill className={`h-6  w-6`} />
      </div>
    </div>
  );
};

export default NavButtons;
