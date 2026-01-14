"use client";
import LinkGenerator from "@/components/modals/club/LinkGenerator";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { sendData } from "@/lib/api";
import { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { useAppDispatch, useAppSelector } from "@/providers/global/hooks";
import { updateCoachField } from "@/providers/global/slices/coach";
import {
  EllipsisVertical,
  Settings,
  Unlink
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function first() {
  return <CurrentStateProvider>
    <div className="content-height-screen content-container">
      <h4>Link Generator</h4>
      <div className="relative">
        <Image
          src="/illustrations/link-generator.svg"
          alt=""
          height={240}
          width={240}
          className="object-contain mx-auto mt-18 md:mt-24"
        />
        <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4">
          <ZoomMeetingOptions />
          <LinkGenerator>
            <DialogTrigger className="px-4 py-2 rounded-[8px] flex items-center gap-2 border-1 border-[var(--accent-1)]">
              <span className="w-[28px] italic text-[12px] text-center leading-[28px] aspect-square rounded-full border-1">
                <span>w</span>
                <span className="text-[var(--accent-1)]">z</span>
              </span>
              <span className="text-base">Without Zoom Meetings</span>
            </DialogTrigger>
          </LinkGenerator>
        </div>
      </div>
    </div>
  </CurrentStateProvider>
}

function ZoomMeetingOptions() {
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const zoom_doc_id = useAppSelector(state => state.coach.data.zoom_doc_id)
  return <div className="flex items-center border-1 border-[var(--accent-1)] rounded-[10px]">
    <LinkGenerator withZoom={true}>
      <DialogTrigger className="px-4 py-2 flex items-center gap-2 rounded-[8px]">
        <span className="w-[28px] min-h-[28px] bg-[#0B5CFF] text-[var(--primary-1)] text-[8px] text-center font-[500] leading-[28px] aspect-square rounded-full">zoom</span>
        <span className="text-xs md:text-base">With Zoom Meeting</span>
      </DialogTrigger>
      {Boolean(zoom_doc_id) && <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <EllipsisVertical className="w-[18px] ml-1 mr-2 cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => setShowDisconnectModal(<DisconnectZoomModal onClose={() => setShowDisconnectModal(false)} />)}
            className="text-412px] text-[var(--accent-2)] py-1 flex items-center gap-2 hover:!text-[var(--primary-1)] hover:!bg-[var(--accent-2)] cursor-pointer"
          >
            <Unlink className="w-[14px]" />
            Disconnect Zoom
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>}
      {showDisconnectModal}
    </LinkGenerator>
  </div>
}

function DisconnectZoomModal({ onClose }) {
  const _id = useAppSelector(state => state.coach.data._id);
  const dispatch = useAppDispatch();

  async function disconnectZoom(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await sendData(`zoom/revoke/${_id}?club=${process.env.NEXT_PUBLIC_ZOOM_CLUB_ID}`, {}, "DELETE");
      if (!response.success) throw new Error(response.message || "Please try again later!");
      toast.success(response.message);
      mutate("coachProfile");
      dispatch(updateCoachField({ zoom_doc_id: undefined }))
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message || "Please try again Later!");
    } finally {
      setLoading(false);
    }
  }

  return <DualOptionActionModal
    description="Are you sure to disconnect zoom?"
    action={(setLoading, closeBtnRef) => disconnectZoom(setLoading, closeBtnRef)}
    defaultOpen={true}
    onOpenChange={onClose}
  >
    <AlertDialogTrigger />
  </DualOptionActionModal>
}