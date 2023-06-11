/* eslint-disable @next/next/no-img-element */
import { useAtom } from "jotai";
import { toast } from "react-hot-toast";
import { AiFillCloseCircle } from "react-icons/ai";
import { typeAtom } from "~/jotai";
import { api } from "~/utils/api";

const FollowCard = ({
  userId,
  type,
}: {
  userId: string;
  type: "follower" | "following";
}) => {
  const ctx = api.useContext();
  const { data: followers, isLoading: followersLoading } =
    api.follow.userIdFollowedBy.useQuery({
      userId,
    });
  const { data: following, isLoading: followingLoading } =
    api.follow.followsByUserId.useQuery({
      userId,
    });

  const { mutate: deleteFollow } = api.follow.delete.useMutation({
    onSuccess: () => {
      void ctx.follow.invalidate();
    },
    onError: (err) => {
      const error = err.data?.zodError?.fieldErrors.content;
      if (error && error[0]) toast.error(error[0]);
      else toast.error("Something went wrong, please try again later");
    },
  });
  const { mutate: unfollowMe } = api.follow.unfollowMe.useMutation({
    onSuccess: () => {
      void ctx.follow.invalidate();
    },
    onError: (err) => {
      const error = err.data?.zodError?.fieldErrors.content;
      if (error && error[0]) toast.error(error[0]);
      else toast.error("Something went wrong, please try again later");
    },
  });

  const [fType, setType] = useAtom(typeAtom);

  if (followersLoading || followingLoading) return <></>;

  return (
    <div className="absolute z-10 w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow  sm:p-8">
      <div className="mb-4 flex items-center justify-between">
        <h5 className="text-xl font-bold capitalize leading-none text-gray-900">
          {fType.type}
        </h5>

        <AiFillCloseCircle
          onClick={() => {
            setType({
              type: fType.type,
              enabled: false,
            });
          }}
          className="h-6 w-6 cursor-pointer hover:text-blue-500"
        />
      </div>
      <div className="flow-root">
        <ul
          role="list"
          className="no-scrollbar min-h-screen divide-y divide-gray-200 overflow-y-scroll md:h-64"
        >
          {type === "follower" &&
            followers &&
            followers.map((v) => {
              return (
                <li key={v.id} className="py-3 sm:py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={v.follower.profileImage}
                        alt="profile image"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        @{v.follower.username}
                      </p>
                    </div>
                    <div
                      onClick={() => {
                        unfollowMe({
                          followerUserId: v.follower.id,
                        });
                      }}
                      className="inline-flex items-center text-base font-semibold text-gray-900 hover:text-blue-500"
                    >
                      <AiFillCloseCircle className="h-6 w-6" />
                    </div>
                  </div>
                </li>
              );
            })}
          {type === "following" &&
            following &&
            following.map((v) => {
              return (
                <li key={v.id} className="py-3 sm:py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={v.following.profileImage}
                        alt="Neil image"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        @{v.following.username}
                      </p>
                    </div>
                    <div
                      onClick={() => {
                        deleteFollow({
                          followedUserId: v.following.id,
                        });
                      }}
                      className="inline-flex items-center text-base font-semibold text-gray-900 hover:text-blue-500 "
                    >
                      <AiFillCloseCircle className="h-6 w-6" />
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};

export default FollowCard;
