import AddClientWithCheckup from "@/components/modals/add-client/AddClientWithCheckup";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { nameInitials } from "@/lib/formatter";
import { Clock } from "lucide-react";
import { useState } from "react";

export default function ClientListFollowUp({ client }) {
  const [modalOpened, setModalOpened] = useState(false);

  return <>
    <div onClick={() => setModalOpened(true)} className="mb-1 px-4 py-2 flex items-center gap-4 cursor-pointer">
      <Avatar className="w-[36px] h-[36px] !rounded-[8px]">
        <AvatarImage className="rounded-[8px]" src={client?.profilePhoto} />
        <AvatarFallback className="rounded-[8px]">{nameInitials(client.name)}</AvatarFallback>
      </Avatar>
      <div className="grow">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-semibold">{client.name}</p>
          <Clock className="w-[14px] h-[14px] text-[var(--accent-2)] ml-auto" strokeWidth={3} />
          {modalOpened && <AddClientWithCheckup
            type="add-details"
            data={{ _id: client.clientId, name: client.name }}
            setModal={setModalOpened}
          />}
        </div>
        <p>{client.nextFollowup}</p>
      </div>
    </div>
  </>
}