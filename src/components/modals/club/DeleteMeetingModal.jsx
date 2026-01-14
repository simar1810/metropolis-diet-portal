import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { sendData } from "@/lib/api";
import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function DeleteMeetingModal({ _id }) {
  const [loading, setLoading] = useState(false);
  const closeBtnRef = useRef(null);

  async function deleteMeeting() {
    try {
      setLoading(true);
      const response = await sendData(`deleteMeetLink?meetingId=${_id}`, {}, "DELETE");
      if (!response.success) throw new Error(response.message);
      toast.success(response.message);
      mutate("getMeetings")
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger>
      <Trash2 className="text-[var(--accent-2)] w-[16px]" />
    </DialogTrigger>
    <DialogContent className="!max-w-[450px] text-center border-0 px-0 overflow-auto gap-0">
      <DialogTitle className="text-[24px]">Are you sure?</DialogTitle>
      <p className="text-[var(--dark-1)]/50 mb-4">The Meeting Link will be permanently deleted.</p>
      <div>
        <DialogClose ref={closeBtnRef} className="bg-[var(--accent-2)] text-white mr-2 py-[9px] px-4 rounded-[8px]">Cancel</DialogClose>
        <Button onClick={deleteMeeting} disabled={loading}>Confirm</Button>
      </div>
    </DialogContent>
  </Dialog>
}