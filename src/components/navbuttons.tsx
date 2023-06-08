import { AiFillHome } from "react-icons/ai";
import { BsBookmarkCheckFill } from "react-icons/bs";
import { FaCompass } from "react-icons/fa";
const NavButtons = () => {
  return (
    <div className="flex items-center justify-around bg-white p-4 text-slate-400 md:hidden">
      <div className="flex h-10 grow items-center justify-center rounded-xl bg-gray-100">
        <AiFillHome className="h-6  w-6 text-blue-500" />
      </div>
      <div className="hover:bg-gray-1001 flex h-10 grow items-center justify-center rounded-xl">
        <FaCompass className="h-6  w-6 " />
      </div>
      <div className="hover:bg-gray-1001 flex h-10 grow items-center justify-center rounded-xl">
        <BsBookmarkCheckFill className="h-6  w-6 " />
      </div>
    </div>
  );
};

export default NavButtons;
