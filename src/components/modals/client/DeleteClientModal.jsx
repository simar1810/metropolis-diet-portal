import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { sendData } from "@/lib/api";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function DeleteClientModal({
  _id,
  onClose,
  defaultOpen,
}) {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const closeBtnRef = useRef(null);

  async function deleteClient() {
    try {
      setLoading(true);
      const response = await sendData(`app/deleteClient?id=${_id}`, {}, "DELETE");
      if (!response.status) throw new Error(response.error);
      toast.success(response.message);
      mutate((key) => typeof key === 'string' && key.startsWith('getAppClients'));
      router.push("/coach/clients");
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <AlertDialog defaultOpen={defaultOpen}>
    {!defaultOpen && <AlertDialogTrigger className="font-semibold text-[var(--accent-2)] px-2 flex items-center gap-2">
      <Trash className="w-[16px] text-[var(--accent-2)]" />
      Delete Client
    </AlertDialogTrigger>}
    <AlertDialogContent className="!max-w-[450px] text-center border-0 px-0 overflow-auto gap-0">
      <AlertDialogTitle className="text-[24px]">Are you sure?</AlertDialogTitle>
      <p className="text-[var(--dark-1)]/50 mb-4">You are deleting a client.</p>
      <div>
        <AlertDialogCancel
          ref={closeBtnRef}
          className="bg-[var(--accent-2)] text-white mr-2 py-[9px] px-4 rounded-[8px]"
          onClick={onClose ? onClose : new Function()}
        >
          Cancel
        </AlertDialogCancel>
        <Button onClick={deleteClient} disabled={loading}>Confirm</Button>
      </div>
    </AlertDialogContent>
  </AlertDialog>
}