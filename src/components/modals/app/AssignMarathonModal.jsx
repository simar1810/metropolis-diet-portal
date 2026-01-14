import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormControl from "@/components/FormControl";
import { Badge } from "@/components/ui/badge";
import useSWR, { mutate } from "swr";
import { getClientsForMarathon } from "@/lib/fetchers/app";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { nameInitials } from "@/lib/formatter";
import { useState } from "react";
import { toast } from "sonner";
import { sendData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";

export default function AssignMarathonModal({ marathonId }) {
  return (
    <Dialog>
      <DialogTrigger className="h-auto text-[var(--accent-1)] font-semibold text-[12px] ml-auto px-0 py-2 px-4 border-1 border-[var(--accent-1)] rounded-[8px]">
        Assign Customer
      </DialogTrigger>
      <DialogContent className="!max-w-[650px] h-[70vh] border-0 p-0 overflow-auto block">
        <DialogHeader className="p-4 border-b-1">
          <DialogTitle className="text-lg font-semibold">
            Assign Marathon
          </DialogTitle>
        </DialogHeader>
        <AssignMealPlanContainer marathonId={marathonId} />
      </DialogContent>
    </Dialog>
  );
}

function AssignMealPlanContainer({ marathonId }) {
  const { isLoading, error, data } = useSWR(`getClientsForMarathon/${marathonId}`, () => getClientsForMarathon(marathonId));
  const [selectedClient, setSelectedClient] = useState();
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />

  async function assignMealPlan() {
    try {
      const data = {
        marathonId,
        clientIds: [selectedClient]
      }
      const response = await sendData("app/marathon/coach/assignClient", data)
      if (response.status_code !== 200) throw new Error(response.error || response.message);
      toast.success(response.message);
      mutate(`getClientsForMarathon/${marathonId}`)
      mutate("app/getMarathons")
    } catch (error) {
      toast.error(error.message);
    }
  }

  const assignedClients = data.data.assignedClients.filter(client => new RegExp(searchQuery, "i").test(client.name));
  const unassignedClients = [
    ...data.data.unassignedClients.filter(client => new RegExp(searchQuery, "i").test(client.name)),
    ...data.data.assignedToOtherPlans.filter(client => new RegExp(searchQuery, "i").test(client.name))
  ]

  return <div className="p-4 mb-auto text-sm space-y-6">
    <div>
      <FormControl
        placeholder="Search Client here"
        className="w-full bg-gray-50 rounded-lg"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <p className="mt-4 font-medium">{unassignedClients.length} Clients Available</p>
    </div>
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h3 className="font-medium mb-4">Plan Already Assigned</h3>
        <div className="space-y-4">
          {assignedClients.map((client, index) => <SelectedClient
            key={index}
            client={client}
          />)}
        </div>
      </div>
      <div>
        <h3 className="font-medium mb-4">Not Assigned</h3>
        <div className="space-y-4">
          {unassignedClients.map((client, index) => <SelectClient
            key={index}
            client={client}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
          />)}
        </div>
      </div>
    </div>
    {selectedClient && <div className="bg-white sticky bottom-0 text-center py-2">
      <Button onClick={assignMealPlan} variant="wz">
        Assign Marathon
      </Button>
    </div>}
  </div>
}

function SelectedClient({ client }) {
  return <div className="flex items-center gap-3">
    <Avatar>
      <AvatarImage src={client.profilePhoto || "/"} />
      <AvatarFallback>{nameInitials(client.name)}</AvatarFallback>
    </Avatar>
    <span className="flex-1">{client.name}</span>
    <FormControl
      type="checkbox"
      checked
      disabled
      className="w-5 h-5"
    />
  </div>
}

function SelectClient({
  client,
  selectedClient,
  setSelectedClient
}) {
  return <div className="flex items-center gap-3">
    <Avatar>
      <AvatarImage src={client.profilePhoto || "/"} />
      <AvatarFallback>{nameInitials(client.name)}</AvatarFallback>
    </Avatar>
    <label className="grow flex items-center gap-3">
      <span className="flex-1 cursor-pointer">{client.name}</span>
      <FormControl
        type="checkbox"
        name="assign"
        value="symond"
        checked={selectedClient === client._id}
        onChange={() => setSelectedClient(prev => prev === client._id ? undefined : client._id)}
        className="w-5 h-5"
      />
    </label>
  </div>
}