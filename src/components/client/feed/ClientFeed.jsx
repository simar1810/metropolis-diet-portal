import NoData from "@/components/common/NoData";
import useSWR from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { getAppFeeds } from "@/lib/fetchers/app";
import ContentError from "@/components/common/ContentError";
import { useEffect, useRef, useState } from "react";
import { pageEnd } from "@/config/state-reducers/feed";
import Image from "next/image";
import YouTubeEmbed from "@/components/common/YoutubeEmbed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { nameInitials } from "@/lib/formatter";
import FeedFooter from "@/components/pages/coach/feed/FeedFooter";
import FeedComments from "@/components/pages/coach/feed/FeedComments";

export default function ClientFeeds() {
  const { dispatch, ...state } = useCurrentStateContext();
  const { isLoading, error, data } = useSWR(
    `app/getAppFeeds?page=${state.page}&type=${state.type}`,
    () => getAppFeeds(state, "client")
  );
  const mountedRef = useRef(false);
  useEffect(function () {
    if (data?.status_code === 201 && mountedRef.current && state.page !== 0) {
      dispatch(pageEnd(state.page - 1))
    }
    mountedRef.current = true;
  }, [isLoading]);

  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} className="!mt-0 border-0 border-b-1 rounded-none" />
  const feeds = data.data;

  if (feeds.length === 0) return <div className="min-h-[400px] mx-auto !mt-0 flex items-center border-b-1">
    <NoData message="No Posts Available" />
  </div>

  return <>
    {feeds.map((feed, index) => <ClientFeed
      key={index}
      feeds={feeds}
      feed={feed}
    />)}
  </>
}

export function ClientFeed({
  feeds,
  feed
}) {
  const [commentsOpened, setCommentsOpened] = useState(false);
  return <div className="relative border-b-1 py-2">
    <FeedHeader feed={feed} />
    <div>
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
        commentsOpened={commentsOpened}
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

function FeedHeader({ feed }) {
  return <div className="bg-white px-4 py-2 flex items-center gap-2">
    <Avatar className="p-[2px] border-1">
      <AvatarImage src={feed.userImg} />
      <AvatarFallback>{nameInitials(feed.userName)}</AvatarFallback>
    </Avatar>
    <p>{feed.userName}</p>
  </div>
}