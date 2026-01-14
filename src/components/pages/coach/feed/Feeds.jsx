import NoData from "@/components/common/NoData";
import useSWR from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { getAppFeeds } from "@/lib/fetchers/app";
import ContentError from "@/components/common/ContentError";
import { useEffect, useRef } from "react";
import { pageEnd } from "@/config/state-reducers/feed";
import Feed from "./Feed";

export default function Feeds() {
  const { dispatch, ...state } = useCurrentStateContext();
  const { isLoading, error, data } = useSWR(
    `app/getAppFeeds?page=${state.page}&type=${state.type}`,
    () => getAppFeeds(state)
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
    {feeds.map((feed, index) => <Feed
      key={index}
      feeds={feeds}
      feed={feed}
    />)}
  </>
}

