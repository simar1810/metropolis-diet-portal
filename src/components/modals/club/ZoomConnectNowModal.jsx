import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { zoomConnectionLink } from "@/lib/utils";
import { useAppSelector } from "@/providers/global/hooks";
import Link from "next/link";

export default function ZoomConnectNowModal() {
  const coachId = useAppSelector(state => state.coach.data._id);
  return <Dialog>
    <DialogTrigger className="text-[var(--accent-1)] px-4 py-2 rounded-[10px]">
      <div className="flex items-center gap-2">
        <span className="w-[28px] min-h-[28px] bg-[#0B5CFF] text-[var(--primary-1)] text-[8px] text-center font-[500] leading-[28px] aspect-square rounded-full">zoom</span>
        <span className="text-black">With Zoom Meetings</span>
      </div>
    </DialogTrigger>
    <DialogContent className="!max-w-[450px] border-0 p-0 overflow-auto">
      <DialogHeader className="bg-[#FBFBFB] py-6 h-[56px] border-b-1">
        <DialogTitle className="text-black text-[20px] ml-5">
          Zoom Connection
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="text-[20px] font-bold px-4 mt-10">Zoom not Connected</p>
        <div className="w-[80px] h-[80px] text-center text-white font-semibold leading-[80px] rounded-[8px] bg-blue-600 mt-10 mb-4">zoom</div>
        <Link
          href={zoomConnectionLink(coachId)}
          target="_blank"
          className="text-[#004FFE] font-semibold px-4 py-2 rounded-[12px] border-2 border-[#004FFE] mb-20"
        >
          Connect Now
        </Link>
      </div>
    </DialogContent>
  </Dialog>
}