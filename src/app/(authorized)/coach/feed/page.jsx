"use client";
import AddPostModal from "@/components/modals/AddPostmodal";
import Feeds from "@/components/pages/coach/feed/Feeds";
import FeedsPersonal from "@/components/pages/coach/feed/FeedsPersonal";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { feedDataInitialState } from "@/config/state-data/feed";
import { changeFeedType, feedReducer, paginate } from "@/config/state-reducers/feed";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { CircleUserRound, Globe, Users } from "lucide-react";

export default function Page() {
  return <CurrentStateProvider
    state={feedDataInitialState}
    reducer={feedReducer}
  >
    <div className="mt-8">
      <Header />
      <FeedContainer />
      <FeedPagination />
    </div>
  </CurrentStateProvider>
}

function Header() {
  const { dispatch, type } = useCurrentStateContext();

  return <div className="flex items-center gap-4 pb-4 border-b">
    <Button
      className={`text-[12px] font-bold hover:bg-[var(--accent-1)] hover:text-white rounded-[16px] 
        ${type === "our" ? "bg-[var(--accent-1)] text-white" : "bg-[var(--dark-1)]/10 text-[var(--dark-2)]"}`}
      onClick={() => dispatch(changeFeedType("our"))}
    >
      <Users />
      <p className="hidden md:block">My Community</p>
    </Button>
    <Button
      className={`text-[12px] font-bold hover:bg-[var(--accent-1)] hover:text-white rounded-[16px] 
        ${type === "global" ? "bg-[var(--accent-1)] text-white" : "bg-[var(--dark-1)]/10 text-[var(--dark-2)]"}`}
      onClick={() => dispatch(changeFeedType("global"))}
    >
      <Globe />
      <p className="hidden md:block">Global Community</p>
    </Button>
    <Button
      className={`text-[12px] font-bold hover:bg-[var(--accent-1)] hover:text-white rounded-[16px] 
        ${type === "mine" ? "bg-[var(--accent-1)] text-white" : "bg-[var(--dark-1)]/10 text-[var(--dark-2)]"}`}
      onClick={() => dispatch(changeFeedType("mine"))}
    >
      <CircleUserRound />
      <p className="hidden md:block">My Posts</p>
    </Button>
    <AddPostModal />
  </div>
}

function FeedContainer() {
  const { type } = useCurrentStateContext()
  return <div className="max-w-[650px] bg-white mt-10 mx-auto relative border-1 border-b-0 rounded-t-[10px]">
    {type === "mine"
      ? <FeedsPersonal />
      : <Feeds />}
  </div>
}

function FeedPagination() {
  const { page, finalPage, dispatch } = useCurrentStateContext();

  function previous() {
    if (page === 1) return;
    dispatch(paginate(page - 1));
  }

  function next() {
    if (page > finalPage) return;
    dispatch(paginate(page + 1));
  }
  return <Pagination className="my-8">
    <PaginationContent className="gap-4">
      {page > 1 && <PaginationPrevious onClick={previous} />}
      {page > 1 && <PaginationItem className="cursor-pointer" onClick={previous}>{page - 1}</PaginationItem>}
      <PaginationItem>
        <PaginationLink isActive>
          {page}
        </PaginationLink>
      </PaginationItem>
      {page < finalPage && <PaginationItem className="cursor-pointer" onClick={next}>{page + 1}</PaginationItem>}
      {page < finalPage && <PaginationNext onClick={next} />}
    </PaginationContent>
  </Pagination>
}