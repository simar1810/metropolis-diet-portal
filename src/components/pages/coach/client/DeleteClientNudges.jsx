import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { sendData } from "@/lib/api";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function DeleteClientNudges({
  children,
  clientId,
  description = "Are you sure you want to delete all notifications for this client?"
}) {
  async function deleteClientNudges(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await sendData(`app/notifications/bulk-delete`, { clientId }, "DELETE");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate(`client/nudges/${clientId}`);
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (children) return <DualOptionActionModal
    description={description}
    action={(setLoading, btnRef) => deleteClientNudges(setLoading, btnRef)}
  >
    {children}
  </DualOptionActionModal>

  return <DualOptionActionModal
    description={description}
    action={(setLoading, btnRef) => deleteClientNudges(setLoading, btnRef)}
  >
    <AlertDialogTrigger>
      <Trash2 className="w-[32px] h-[32px] text-white bg-[var(--accent-2)] p-[6px] rounded-[4px]" />
    </AlertDialogTrigger>
  </DualOptionActionModal>
}