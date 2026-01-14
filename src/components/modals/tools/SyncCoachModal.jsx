import SelectControl from "@/components/Select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { sendData } from "@/lib/api";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function SyncCoachModal({
  children,
  coachId,
  defaultValue
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: defaultValue,
    coachId
  });

  const closeBtnRef = useRef();

  async function changeSyncStatus() {
    try {
      setLoading(true);
      const response = await sendData(`app/sync-coach/super`, formData);
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate("app/sync-coach/super");
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    {children}
    {!children && <DialogTrigger>
      <Badge variant="wz" className="hover:bg-[var(--accent-1)] hover:text-[var(--primary-1)]">Change Status</Badge>
    </DialogTrigger>}
    <DialogContent className="!max-w-[500px] max-h-[70vh] overflow-y-auto gap-0 border-0 p-0">
      <DialogHeader className="py-4 px-6 border-b">
        <DialogTitle className="text-lg font-semibold">
          Update The Sync Status
        </DialogTitle>
      </DialogHeader>
      <div className="p-4">
        <SelectControl
          label="Change the Status"
          options={[
            { id: 1, name: "Move to Requested", value: 1 },
            { id: 2, name: "Approved", value: 2 },
            { id: 3, name: "Cancel", value: 3 },
          ]}
          value={formData.status}
          onChange={e => setFormData(prev => ({ ...prev, status: Number(e.target.value) }))}
        />
        <Button onClick={changeSyncStatus} disabled={loading} variant="wz" className="mt-10">Update</Button>
        <DialogClose ref={closeBtnRef} />
      </div>
    </DialogContent>
  </Dialog>
}