import FormControl from "@/components/FormControl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { sendData } from "@/lib/api";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function AddVolumePointsModal({ _id, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    points: "",
    date: "",
    clientId: _id
  });

  const closeBtnRef = useRef(null);

  async function addVolumePoints() {
    try {
      setLoading(true);
      const response = await sendData(`addVolumePoints`, formData);
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate(`getClientVolumePoints/${_id}`);
      if (onSubmit) onSubmit()
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    <DialogTrigger className="font-semibold text-[12px] text-[var(--primary-1)] bg-[var(--accent-1)] px-4 py-2 rounded-[8px]">
      Add
    </DialogTrigger>
    <DialogContent className="!max-w-[450px] border-0 px-0 overflow-auto gap-0">
      <DialogTitle className="text-[24px] px-4">Add Membership</DialogTitle>
      <div className="mt-6 px-4">
        <FormControl
          value={formData.points}
          onChange={(e) => setFormData({ ...formData, points: e.target.value })}
          label="Points"
          type="number"
          placeholder="Enter points"
          className="block mb-4"
        />
        <FormControl
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          label="Membership Date"
          type="date"
          placeholder="Enter Date"
        />
        <Button
          variant="wz"
          disabled={loading}
          onClick={addVolumePoints}
          className="mt-8"
        >
          Add
        </Button>
        <DialogClose ref={closeBtnRef} />
      </div>
    </DialogContent>
  </Dialog>
}