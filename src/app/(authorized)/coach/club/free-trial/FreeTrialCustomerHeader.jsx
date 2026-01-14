import FormControl from "@/components/FormControl";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { fetchBlobData } from "@/lib/apiClient";
import { copyText } from "@/lib/utils";
import { useAppSelector } from "@/providers/global/hooks";
import { FolderInput, FolderOutput, Forward } from "lucide-react";
import { toast } from "sonner";

export default function FreeTrialCustomerHeader() {
  const _id = useAppSelector((state) => state.coach.data._id);

  async function exportFreeTrialUsers(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await fetchBlobData(`export-clients-excel`);
      const data = await response.blob();
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'clients.csv');
      document.body.appendChild(link);

      link.click();
      link.parentNode.removeChild(link);
      toast.success(response.message);
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <>
    <div className="mb-4 flex flex-col items-start md:justify-between md:flex-row md:items-center gap-2 md:gap-4">
      <h4>Free Trial</h4>
      <div className="flex gap-2 md:gap-6 items-center justify-start">
      <FormControl
        className="lg:min-w-[280px] [&_.input]:focus:shadow-2xl [&_.input]:bg-[var(--comp-1)] text-[12px] ml-auto"
        placeholder="Search Client.."
      />
      <Button
        onClick={() => {
          copyText(`${process.env.NEXT_PUBLIC_CLIENT_ENDPOINT}/onboarding-form?id=${_id}`);
          toast.success("Link copied to clipboard");
        }}
        size="sm"
        variant="wz"
      >
        <Forward />
        Onboarding Form
        </Button>
      </div>
    </div>
    <div className="py-4 flex items-center justify-end gap-2 border-t-1">
      {/* <Button size="sm" variant="wz_outline">
        <FolderInput />
        Import Data
      </Button>
      <DualOptionActionModal
        action={(setLoading, closeBtnRef) => exportFreeTrialUsers(setLoading, closeBtnRef)}
        description="Are you sure you want to export the data?"
      >
        <AlertDialogTrigger className="h-8 text-[var(--accent-1)] text-[14px] font-bold px-4 flex items-center gap-2 border-1 rounded-[8px] border-[var(--accent-1)]">
          <FolderOutput size={16} />
          Export Data
        </AlertDialogTrigger>
      </DualOptionActionModal>
      <Button size="sm" variant="wz_outline">
        Demo
      </Button> */}
    </div>
  </>
}