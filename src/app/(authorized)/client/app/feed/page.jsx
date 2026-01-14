"use client";
import ClientFeeds from "@/components/client/feed/ClientFeed";
import ClientPersonalFeeds from "@/components/client/feed/ClientPersonalFeeds";
import AddPostClientModal from "@/components/modals/client/AddPostClientModal";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { feedDataInitialState } from "@/config/state-data/feed";
import { feedReducer, paginate } from "@/config/state-reducers/feed";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";

export default function Page() {
  return <CurrentStateProvider
    state={{
      ...feedDataInitialState,
      type: "our"
    }}
    reducer={feedReducer}
  >
    <div className="content-container content-height-screen">
      <div className="flex items-center gap-4">
        <AddPostClientModal />
      </div>
      <FeedContainer />
      <FeedPagination />
    </div>
  </CurrentStateProvider>
}

function FeedContainer() {
  const { type } = useCurrentStateContext()
  return <div className="grid md:grid-cols-3 gap-5 bg-white mt-10 mx-auto relative border-1 border-b-0 rounded-t-[10px]">
    {type === "mine"
      ? <ClientPersonalFeeds />
      : <ClientFeeds />}
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