import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ClientClubDataComponent from "@/components/pages/coach/client/ClientClubDataComponent";
import { Tabs } from "@/components/ui/tabs";
import { CalendarRange } from "lucide-react";

export default function PendingClientClubDataModal({
  open,
  onClose,
  children,
  clientData,
  mutateQuery,
  onSubmit
}) {
  return <Dialog defaultOpen={open} onOpenChange={onClose}>
    {!Boolean(children) && <DialogTrigger className="w-full bg-[var(--accent-1)] text-[var(--primary-1)] text-[14px] font-semibold pr-3 py-2 flex items-center justify-center gap-2 rounded-[8px]">
      <CalendarRange />
      Club Details
    </DialogTrigger>}
    {children}
    <DialogContent className="!max-w-[650px] max-h-[70vh] border-b-1 p-0 gap-0 overflow-y-auto">
      <DialogHeader className="p-4 border-b-1">
        <DialogTitle className="text-[24px]">Club Details</DialogTitle>
      </DialogHeader>
      <Tabs value="club" className="p-4">
        <ClientClubDataComponent
          mutateQuery={mutateQuery}
          clientData={clientData}
          onSubmit={onSubmit}
        />
      </Tabs>
    </DialogContent>
  </Dialog>
}