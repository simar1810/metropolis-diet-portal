import Image from "next/image";
import FeedFooter from "./FeedFooter";
import FeedHeader from "./FeedHeader";
import FeedComments from "./FeedComments";
import YouTubeEmbed from "@/components/common/YoutubeEmbed";
import { useState } from "react";

export default function Feed({
  feeds,
  feed
}) {
  const [commentsOpened, setCommentsOpened] = useState(false);
  return <div className="relative border-b-1 py-2">
    <div>
      <FeedHeader feed={feed} />
      {feed.contentType === "img"
        ? <FeedImage images={feed.images} />
        : <FeedVideo video={feed.video} />}
      <FeedFooter
        feeds={feeds}
        feed={feed}
        setCommentsOpened={setCommentsOpened}
      />
    </div>
    {commentsOpened && <div className={`max-w-[450px] min-w-0 h-full bg-white absolute right-0 top-0 border-1 border-[var(--accent-1)]/50 overflow-y-auto custom-scrollbar ${commentsOpened ? "w-full" : "w-0"}`}>
      <FeedComments
        setCommentsOpened={setCommentsOpened}
        postId={feed.postId}
      />
    </div>}
  </div>
}

function FeedImage({ images }) {
  return <div className="relative aspect-[7/4] bg-black border-y-1">
    <Image
      src={images?.at(0) || "/not-found.png"}
      fill
      alt=""
      className="object-contain !aspect-square"
    />
  </div>
}

function FeedVideo({ video }) {
  return <div className="relative aspect-[4/3] bg-black border-y-1">
    <YouTubeEmbed link={video} />
  </div>
}