import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendData } from "@/lib/api";
import { useAppSelector } from "@/providers/global/hooks";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function UpdateCoachSpecializationModal({ defaultValue }) {
  const [loading, setLoading] = useState(false);
  const [specialization, setSpecialization] = useState(() => defaultValue);

  const _id = useAppSelector(state => state.coach.data._id);

  const closeBtnRef = useRef(null);

  async function updateCoachSpecialization() {
    try {
      setLoading(true);
      const response = await sendData(`app/updateCoachProfile`, { specialization, coachId: _id }, "POST");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate("coachProfile")
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
      <DialogTitle className="text-[24px] mb-4">Specialization</DialogTitle>
      <div>
        <div className="mt-8 grid w-full gap-1.5">
          <Label htmlFor="message" className="font-bold text-[var(--dark-1)]/50 mb-2">Write something about your specialization</Label>
          <Textarea
            placeholder="Write specialization."
            id="message"
            value={specialization}
            onChange={e => setSpecialization(e.target.value)}
            className="focus-visible:ring-[0px] min-h-[150px]"
          />
        </div>
        <Button
          variant="wz"
          onClick={updateCoachSpecialization}
          disabled={loading}
          className="mt-8"
        >
          Save details
        </Button>
        <DialogClose ref={closeBtnRef} />
      </div>
    </DialogContent>
  </Dialog>
}