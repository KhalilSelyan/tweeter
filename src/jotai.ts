import { atom } from "jotai";

export const homeAtom = atom<"home" | "bookmark" | "explore">("home");
export const typeAtom = atom<{
  type: "follower" | "following";
  enabled: boolean;
}>({
  type: "follower",
  enabled: false,
});
