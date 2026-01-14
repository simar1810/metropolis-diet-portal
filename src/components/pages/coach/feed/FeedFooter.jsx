import { sendData } from "@/lib/api";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import {
  Bookmark,
  Heart,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";

const payloadMutateFn = {
  "global": generateMutatePayload1,
  "our": generateMutatePayload1,
  "mine": generateMutatePayload2
}

export default function FeedFooter({
  feeds,
  feed,
  setCommentsOpened
}) {
  const { page, type, displayedPostsType } = useCurrentStateContext();

  async function likeDislike(status) {
    try {
      const data = {
        postId: feed.postId,
        like: status
      }
      await sendData("app/feedActivity", data, "POST");
      mutate(...payloadMutateFn[type](page, type, feeds, feed.postId, "isLikedByMe", displayedPostsType))
    } catch (error) {
      toast.error(error.message || "Please try again later!");
    }
  }

  async function saveUnsave(status) {
    try {
      const data = {
        postId: feed.postId,
        save: status
      }
      await sendData("app/feedActivity", data, "POST");
      mutate(...payloadMutateFn[type](page, type, feeds, feed.postId, "isSavedByMe", displayedPostsType))
    } catch (error) {
      toast.error(error.message || "Please try again later!");
    }
  }

  return <div className=" px-4 pb-2">
    <div className="bg-white text[var(--dark-3)] pt-3 pb-1 flex items-center gap-1">
      <Heart
        fill={feed.isLikedByMe ? "#FF1D1D" : "transparent"}
        stroke={feed.isLikedByMe ? "#FF1D1D" : "#000000"}
        className="w-[20px] h-[20px] cursor-pointer"
        onClick={() => likeDislike(!feed.isLikedByMe)}
      />
      <p>{feed.likesCount}</p>
      <MessageCircle
        onClick={() => setCommentsOpened(prev => !prev)}
        className="w-[20px] h-[20px] ml-2 cursor-pointer"
      />
      <p>{feed.commentsCount}</p>
      <Bookmark
        fill={feed.isSavedByMe ? "#000000" : "transparent"}
        stroke={feed.isSavedByMe ? "#000000" : "#000000"}
        className="w-[20px] h-[20px] ml-auto cursor-pointer"
        onClick={() => saveUnsave(!feed.isSavedByMe)}
      />
    </div>
    <p>{feed.caption}</p>
  </div>
}

function generateMutatePayload1(page, type, feeds, postId, field) {
  return [
    `app/getAppFeeds?page=${page}&type=${type}`,
    {
      status_code: 200,
      data: feeds.map(post => post.postId === postId ? { ...post, [field]: !post[field] } : post)
    }
  ]
}

function generateMutatePayload2(page, _, feeds, postId, field, displayedPostsType) {
  return [
    `app/my-posts?page=${page}`,
    {
      status_code: 200,
      data: {
        ...feeds,
        [displayedPostsType]: feeds[displayedPostsType].map(post => post.postId === postId ? { ...post, [field]: !post[field] } : post)
      }
    }
  ]
}