
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendData } from "@/lib/api";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function UpdateClientNotesModal({ id, defaultValue }) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(() => defaultValue || "");

  const closeBtnRef = useRef(null);

  async function updateClientGoal() {
    try {
      setLoading(true);
      const data = new FormData();
      data.append("notes", notes);
      const response = await sendData(`app/updateClient?id=${id}`, { notes }, "PUT");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate(`clientDetails/${id}`)
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger className="text-[var(--accent-1)] text-[14px] font-semibold pr-3">
      Edit
    </DialogTrigger>
    <DialogContent className="!max-w-[450px] text-center border-0 px-4 overflow-auto gap-0">
      <DialogTitle className="text-[24px] mb-4">Edit Notes</DialogTitle>
      <div>
        <div className="mt-4 grid w-full gap-1.5">
          <Label htmlFor="message" className="font-bold text-[var(--dark-1)]/50 mb-2">Assign new goal to your Client</Label>
          <Textarea
            placeholder="Write notes yourself."
            id="message"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="focus-visible:ring-[0px] min-h-[150px]"
          />
        </div>
        <Button
          variant="wz"
          onClick={updateClientGoal}
          disabled={loading}
          className="mt-8"
        >
          Update Notes
        </Button>
        <DialogClose ref={closeBtnRef} />
      </div>
    </DialogContent>
  </Dialog>
}