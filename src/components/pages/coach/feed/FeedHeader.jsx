import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { sendData } from "@/lib/api";
import { nameInitials } from "@/lib/formatter";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { useAppSelector } from "@/providers/global/hooks";
import { EllipsisVertical, Settings, Share, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function FeedHeader({ feed }) {
  const { type } = useCurrentStateContext()
  return <div className="bg-white px-4 py-2 flex items-center gap-2">
    <Avatar className="p-[2px] border-1">
      <AvatarImage src={feed.userImg} />
      <AvatarFallback>{nameInitials(feed.userName)}</AvatarFallback>
    </Avatar>
    <p>{feed.userName}</p>
    {["mine", "our"].includes(type) && <FeedActions
      postId={feed.postId}
      feed={feed}
    />}
  </div>
}

function FeedActions({ postId, feed }) {
  async function deleteFeed(setLoading, closeBtnRef) {
    try {
      setLoading(true)
      const response = await sendData(`app/delete-feed?postId=${postId}`, {}, "DELETE");
      if (response.status_code !== 200) throw new Error(response.message || "Please try again Later!");
      mutate((key) => typeof key === 'string' &&
        (key.startsWith('app/getAppFeeds') || key.startsWith("app/my-posts")));
      toast.success(response.message || "Feed deleted Successfully");
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <EllipsisVertical className="w-[20px] ml-auto cursor-pointer" />
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      {/* <DropdownMenuLabel className="text-[14px] py-0 flex items-center gap-2 cursor-pointer">
        <Share className="w-[14px]" />
        Share
      </DropdownMenuLabel> */}
      {/* <DropdownMenuLabel className="text-[14px] py-0 flex items-center gap-2 cursor-pointer">
          <Settings className="w-[14px]" />
          Edit Feed
        </DropdownMenuLabel>
        <DropdownMenuSeparator /> */}
      <DropdownMenuLabel className="py-0">
        <DualOptionActionModal
          action={(setLoading, closeBtnRef) => deleteFeed(setLoading, closeBtnRef)}
          description="Do you want to delete this feed!"
        >
          <AlertDialogTrigger className="text-412px] text-[var(--accent-2)] py-0 flex items-center gap-2 cursor-pointer">
            <Trash2 className="w-[14px]" />
            Delete
          </AlertDialogTrigger>
        </DualOptionActionModal>
      </DropdownMenuLabel>
    </DropdownMenuContent>
  </DropdownMenu>
}