import TopPerformerClientList from "./ClientListTopPerformer";
import { useState } from "react";
import QuickAddClient from "@/components/modals/add-client/QuickAddClient";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TopPerformers({ clients }) {
  const [modalOpened, setModalOpened] = useState(false);

  return <div className="bg-white py-4 rounded-[10px] border-1">
    <div className="mb-4 px-4 flex items-center justify-between">
      <p className="text-[14px] font-bold">Top Performers</p>
      {modalOpened && <QuickAddClient setModal={setModalOpened} />}
    </div>
    <div className="divide-y-1 divide-[#ECECEC]">
      {clients.map(client => <TopPerformerClientList
        key={client.clientId}
        src={client.profilePhoto}
        name={client.name}
        id={client.clientId}
      />)}
    </div>
    <Button
      variant="outline"
      size="sm"
      className="h-auto w-[calc(100%-32px)] text-[12px] text-[var(--accent-1)] hover:bg-[var(--accent-1)] hover:text-[var(--primary-1)] font-bold py-2 mx-4 gap-1 border-[var(--accent-1)] border-2"
      onClick={() => setModalOpened(true)}
    >
      <Plus />
      Add Client
    </Button>
  </div>
}