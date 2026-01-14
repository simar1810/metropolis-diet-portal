import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { sendData } from "@/lib/api";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function ClientActivityModal({ id, defaultValue }) {
  const [loading, setLoading] = useState(false);

  const closeBtnRef = useRef(null);


  return <Dialog>
    <DialogTrigger className="text-[var(--accent-1)] text-[14px] font-semibold pr-3">
      Edit
    </DialogTrigger>
    <DialogContent className="!max-w-[450px] text-center border-0 px-4 overflow-auto gap-0">
      <DialogTitle className="text-[24px] mb-4">Edit Activity</DialogTitle>
      <div>
        ClientActivityModal
        <Button
          variant="wz"
          disabled={loading}
          className="mt-8"
        >
          Update Goal
        </Button>
        <DialogClose ref={closeBtnRef} />
      </div>
    </DialogContent>
  </Dialog>
}