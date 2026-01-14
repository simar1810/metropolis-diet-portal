import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { sendData } from "@/lib/api";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import { Pencil } from "lucide-react";
import FormControl from "@/components/FormControl";

export default function EditClientRollnoModal({
  _id,
  defaultValue,
  open,
  onClose,
  mutateFn
}) {
  const [loading, setLoading] = useState(false);
  const [rollno, setRollno] = useState(() => defaultValue || "");

  const closeBtnRef = useRef(null);

  async function generateClientRollno() {
    try {
      setLoading(true)
      const response = await sendData(`edit-rollno?id=${_id}`, { clientId: _id, newRollNumber: rollno });
      if (!response.success) throw new Error(response.message);
      toast.success(response.message);
      mutate(`clientDetails/${_id}`);
      mutate((key) => typeof key === 'string' && key.startsWith('getAppClients'))
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog defaultOpen={open} onOpenChange={onClose}>
    {!open
      ? <DialogTrigger className="text-[var(--dark-1)]/50 p-0 flex items-center gap-1">
        <p className="pr-2">|</p>
        <p className="text-[14px] font-semibold pb-[2px]">Roll No - {defaultValue}</p>
        <Pencil strokeWidth={2.5} className="w-[12px] h-[12px] text-[var(--dark-2)] font-semibold" />
      </DialogTrigger>
      : <DialogTrigger className="w-0" />}
    <DialogContent className="!max-w-[450px] text-center border-0 px-4 overflow-auto gap-0">
      <DialogTitle className="text-[24px] mb-4">Edit Roll Number</DialogTitle>
      <div>
        <FormControl
          placeholder="Enter the new roll number for the client."
          className="mb-4"
          value={rollno}
          onChange={(e) => setRollno(e.target.value)}
        />
        <Button
          disabled={loading}
          variant="wz"
          onClick={generateClientRollno}
          className="mt-8"
        >
          Save
        </Button>
      </div>
      <DialogClose ref={closeBtnRef} />
    </DialogContent>
  </Dialog>
}