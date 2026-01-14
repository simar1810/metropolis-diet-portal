import FormControl from "@/components/FormControl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { reviewVPFormControls } from "@/config/data/forms";
import { sendData } from "@/lib/api";
import { useAppSelector } from "@/providers/global/hooks";
import { format, parse } from "date-fns";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function ReviewVPModal({ vp }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => generateInitialValues(vp))

  const closeBtnRef = useRef(null);
  const _id = useAppSelector(state => state.coach.data._id);

  async function acceptRejectVP(status) {
    try {
      setLoading(true);
      const data = {
        vpId: vp._id,
        coachId: _id,
        status: status,
        date: formData.date,
        points: formData.points
      }
      const response = await sendData(`acceptRejectVpPost?`, data, "POST");

      if (response.success === false || response.status_code !== 200) {
        throw new Error(response.message);
      }
      toast.success(response.message);
      closeBtnRef.current.click();
      mutate("getRequestVolumePoints")
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger className="w-full h-8 px-4 py-2 text-[14px] has-[>svg]:px-3 bg-[var(--accent-1)] bg-white text-[var(--accent-1)] border-1 border-[var(--accent-1)] font-semibold rounded-[8px]">
      Review
    </DialogTrigger>
    <DialogContent className="!max-w-[500px] max-h-[65vh] text-center border-0 px-0 overflow-auto gap-0">
      <DialogTitle className="text-[24px]">Review Volume Points</DialogTitle>
      <div className="text-left mt-8 px-4">
        {reviewVPFormControls.map(field => <FormControl
          key={field.id}
          className="[&_.input]:mb-4"
          value={formData[field.name]}
          onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
          {...field}
        />)}
        <h5>Screenshot</h5>
        {vp.screenShot && <Image
          src={vp.screenShot}
          alt=""
          height={400}
          width={400}
          className="w-full max-h-[280px] mt-2 mb-8 object-contain"
        />}
        <div className="flex gap-2">
          <Button onClick={() => acceptRejectVP(0)} disabled={loading} className="grow" variant="destructive">Reject</Button>
          <Button onClick={() => acceptRejectVP(1)} disabled={loading} className="grow" variant="wz">Approve</Button>
          <DialogClose ref={closeBtnRef} />
        </div>
      </div>
    </DialogContent>
  </Dialog>
}

function getDefaultValue(name, obj) {
  switch (name) {
    case "rollno":
      return obj.clientId.rollno;
    case "date":
      return format(parse(obj.date, "dd-MM-yyyy", new Date()), "yyyy-MM-dd");
    case "points":
      return obj.points;
  }
}

function generateInitialValues(obj) {
  const payload = {}
  for (const name of ["rollno", "date", "points"]) {
    payload[name] = getDefaultValue(name, obj)
  }
  return payload;
}