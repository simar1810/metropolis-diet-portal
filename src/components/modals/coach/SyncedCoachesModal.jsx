import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import FormControl from "@/components/FormControl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendData } from "@/lib/api";
import { getSyncedCoachesClientList } from "@/lib/fetchers/app";
import { nameInitials } from "@/lib/formatter";
import { useAppSelector } from "@/providers/global/hooks";
import { useRef, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import AddSubscriptionModal from "../club/AddSubscriptionModal";
import SubscriptionHistory from "@/components/pages/coach/client/SubscriptionHistory";
import VolumePointHistory from "@/components/pages/coach/client/VolumePointHistory";


export default function SyncedCoachesModal({ coachId }) {
  return <Dialog>
    <DialogTrigger>
      <Badge variant="wz_fill">Clients</Badge>
    </DialogTrigger>
    <DialogContent className="!max-w-[850px] text-center border-0 px-4 overflow-auto gap-0">
      <DialogTitle className="text-[24px] mb-4">All Clients</DialogTitle>
      <ClientsContainer coachId={coachId} />
    </DialogContent>
  </Dialog>
}

export function ClientsContainer({ coachId }) {
  const { isLoading, error, data } = useSWR(`sync-coach/super/client${coachId}`, () => getSyncedCoachesClientList(coachId));
  if (isLoading) return <ContentLoader />

  if (error || !data?.success) return <ContentError title={error || data?.message} />
  const clients = data.data;
  return <div className="mt-8 grid grid-cols-2 gap-4">
    {clients.map((client, index) => <SyncedCoachClientDetails
      client={client}
      key={index}
    />)}
  </div>
}

export function SyncedCoachClientDetails({
  children,
  onUpdate,
  client
}) {
  const [formData, setFormData] = useState({ ...client, client_doc_id: client._id });
  const [loading, setLoading] = useState(false);

  const clubSystem = useAppSelector(state => state.coach.data.clubSystem);

  const closeBtnRef = useRef()

  async function udpateDetails() {
    try {
      setLoading(true);
      const data = {}
      for (const key in formData) {
        if (formData[key]) data[key] = formData[key]
      }
      const response = await sendData(`app/sync-coach/super/client`, data, "PUT");
      if (!response.success) throw new Error(response.message);
      toast.success(response.message);
      if (onUpdate) {
        onUpdate()
      } else {
        mutate(`sync-coach/super/client${client.coachId}`);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Dialog>
    {children}
    {!children && <DialogTrigger>
      <div className="bg-[var(--comp-2)] border-1 rounded-[4px] mb-1 px-4 py-2 flex items-center gap-4">
        <Avatar className="w-[36px] h-[36px] !rounded-[8px]">
          <AvatarImage className="rounded-[8px]" src={client.profilePhoto} />
          <AvatarFallback className="rounded-[8px]">{nameInitials(client.name)}</AvatarFallback>
        </Avatar>
        <p className="text-[14px] font-semibold">{client.name}</p>
      </div>
    </DialogTrigger>}
    <DialogContent className="!max-w-[850px] max-h-[70vh] overflow-y-auto w-full">
      <DialogHeader className="flex-row items-center gap-4">
        <Avatar className="w-[64px] h-[64px] !rounded-[8px] border-1">
          <AvatarImage className="rounded-[8px]" src={client.profilePhoto} />
          <AvatarFallback className="rounded-[8px]">{nameInitials(client.name)}</AvatarFallback>
        </Avatar>
        <div>
          <DialogTitle className="!text-[24px] leading-[1]">{client.name}</DialogTitle>
          <p className="text-[var(--dark-1)]/50 text-[14px] font-bold leading-[1]"># {client.clientId}</p>
        </div>
      </DialogHeader>
      <div className="grid grid-cols-2 items-end gap-y-2 gap-x-4">
        <FormControl
          label="Client Name"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="[&_.label]:text-[14px]"
          placeholder="Please fill the detail!"
        />
        <FormControl
          label="Email"
          type="email"
          value={formData.email}
          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="[&_.label]:text-[14px]"
          placeholder="Please fill the detail!"
        />
        <FormControl
          label="Mobile Number"
          type="number"
          value={formData.mobileNumber}
          onChange={e => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
          className="[&_.label]:text-[14px]"
          placeholder="Please fill the detail!"
        />
        <FormControl
          label="Roll No"
          value={formData.rollno}
          onChange={e => setFormData(prev => ({ ...prev, rollno: e.target.value }))}
          className="[&_.label]:text-[14px]"
          placeholder="Please fill the detail!"
        />
      </div>
      <div className="mb-10 flex gap-4">
        <Button
          disabled={loading}
          onClick={udpateDetails}
          variant="wz_outline"
        >
          Save
        </Button>
      </div>
      {[0, 1].includes(clubSystem) && <SubscriptionHistory _id={client._id} />}
      {[2].includes(clubSystem) && <VolumePointHistory _id={client._id} />}
      <DialogClose ref={closeBtnRef} />
    </DialogContent>
  </Dialog>
}