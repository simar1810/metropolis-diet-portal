import useSWR from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { getAppPersonalFeeds } from "@/lib/fetchers/app";
import ContentError from "@/components/common/ContentError";
import { useEffect } from "react";
import { pageEnd } from "@/config/state-reducers/feed";
import Feed from "./Feed";
import NoData from "@/components/common/NoData";

export default function FeedsPersonal() {
  const { dispatch, displayedPostsType, ...state } = useCurrentStateContext();
  const { isLoading, error, data } = useSWR(
    `app/my-posts/page=${state.page}/10000000000`,
    () => getAppPersonalFeeds(state, 10000000000)
  );
  useEffect(function () {
    if (data?.status_code === 201) {
      dispatch(pageEnd(state.page - 1))
    }
  }, [isLoading]);

  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError
    title={error || data?.message}
    className="!mt-0 border-0 border-b-1 rounded-none"
  />

  const feeds = [...data.data.mySavedPosts || [], ...data.data.myPosts || []];

  if (feeds.length === 0) return <div className="min-h-[400px] border-b-1 flex items-center justify-center">
    <NoData message="No feeds Available!" />
  </div>

  return <div className="max-w-[650px] bg-white mx-auto relative rounded-t-[10px]">
    {feeds.map((feed, index) => <Feed
      key={index}
      feeds={data.data}
      feed={feed}
    />)}
  </div>
}