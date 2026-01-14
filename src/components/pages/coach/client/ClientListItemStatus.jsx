import { EllipsisVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import DeleteClientModal from "@/components/modals/client/DeleteClientModal";
import { useState } from "react";
import { nameInitials } from "@/lib/formatter";
import AddClientWithCheckup from "@/components/modals/add-client/AddClientWithCheckup";
import { DialogTrigger } from "@/components/ui/dialog";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { mutate } from "swr";
import { sendData } from "@/lib/api";
import EditClientRollnoModal from "@/components/modals/client/EditClientRollnoModal";
import { toast } from "sonner";
import PendingClientClubDataModal from "@/components/modals/client/PendingClientClubDataModal";
import ClientUpdateCategories from "./ClientUpdateCategories";

export default function ClientListItemStatus({
  client,
  categories
}) {
  const [modal, setModal] = useState();
  const [modalOpened, setModalOpened] = useState(false);

  return <div className="mb-1 px-1 md:px-4 py-2 flex flex-col-reverse items-start">
    {modal}
    <div className="flex md:hidden flex-wrap items-center gap-1 mt-2">
      {client.categories
        .filter(category => categories.has(category))
        .map(category => <Badge
          key={category}
          className="text-[8px] font-bold"
        >
          {categories.get(category)}
        </Badge>)}
    </div>
    <div className="flex gap-4 items-center w-full">
      <Link className="grow flex items-center gap-4" href={`/coach/clients/${client._id}`}>
        <Avatar className="w-[36px] h-[36px] !rounded-[8px]">
          <AvatarImage className="rounded-[8px]" src={client.profilePhoto} />
          <AvatarFallback className="rounded-[8px]">{nameInitials(client.name)}</AvatarFallback>
        </Avatar>
        <p className="text-[12px] font-semibold mr-auto">{client.name}</p>
      </Link>
      {/* {client.isVerified
      ? 
      : <div onClick={() => setModalOpened(true)} className="grow flex items-center gap-4">
        <Avatar className="w-[36px] h-[36px] !rounded-[8px]">
          <AvatarImage className="rounded-[8px]" src={client.profilePhoto} />
          <AvatarFallback className="rounded-[8px]">{nameInitials(client.name)}</AvatarFallback>
        </Avatar>
        <p className="text-[12px] font-semibold">{client.name}</p>
        {Boolean(client.rollno) && <p className="text-[var(--accent-1)] text-[12px] font-bold mr-auto cursor-pointer">
          #{client.rollno}
        </p>}
      </div>} */}
      {/* {!client.isVerified && modalOpened && <AddClientWithCheckup
      type="add-details"
      data={client}
      setModal={setModalOpened}
    />} */}
      {/* <div className="hidden md:flex flex-wrap items-center gap-1">
      {client.categories
        .filter(category => categories.has(category))
        .map(category => <Badge
          key={category}
          className="text-[8px] font-bold"
        >
          {categories.get(category)}
        </Badge>)}
    </div> */}

      {/* {client.isVerified
      ? <Badge className={`text-white font-semibold ${client.isActive ? "bg-[var(--accent-1)] border-[var(--accent-1)]" : "bg-red-600 border-red-600"}`}>{client.isActive?"Active":"In active"}</Badge>
      : <Badge
        variant="outline"
        className="text-[var(--accent-2)] font-semibold border-[var(--accent-2)]"
      >Pending</Badge>} */}
      {/* <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <EllipsisVertical className="cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {Boolean(client.rollno) && <DropdownMenuItem
          onClick={() => setModal(<PendingClientClubDataModal
            clientData={client}
            onClose={() => setModal()}
            defaultValue={client.rollno}
            open={true}
          >
            <DialogTrigger />
          </PendingClientClubDataModal>)}
          className="cursor-pointer"
        >
          Club Details
        </DropdownMenuItem>}
        <DropdownMenuItem
          onClick={() => setModal(<ClientUpdateCategories
            clientData={client}
            onClose={() => setModal()}
            defaultValue={client.rollno}
            open={true}
          >
            <DialogTrigger />
          </ClientUpdateCategories>)}
          className="cursor-pointer"
        >
          Client Categories
        </DropdownMenuItem>
        {Boolean(client.rollno) && <DropdownMenuItem
          onClick={() => setModal(<EditClientRollnoModal
            _id={client._id}
            onClose={() => setModal()}
            defaultValue={client.rollno}
            open={true}
          />)}
          className="cursor-pointer"
        >
          Update Roll Number
        </DropdownMenuItem>}
        {!Boolean(client.rollno) && <DropdownMenuItem
          onClick={() => setModal(<GenerateRollNo
            _id={client._id}
            onClose={() => setModal()}
            open={true}
          />)}
          className="cursor-pointer"
        >
          Generate Roll Number
        </DropdownMenuItem>}
        <DropdownMenuItem
          onClick={() => setModal(<DeleteClientModal
            defaultOpen={true}
            _id={client._id}
            onClose={() => setModal()}
          />)}
          className="cursor-pointer"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu> */}
    </div>

  </div>
}

function GenerateRollNo({
  open,
  onClose,
  _id
}) {
  async function generateClientRollno(setLoading, closeBtnRef) {
    try {
      setLoading(true)
      const response = await sendData(`edit-rollno?id=${_id}`, { clientId: _id });
      if (!response.success) throw new Error(response.message);
      toast.success(response.message);
      mutate((key) => typeof key === 'string' && key.startsWith('getAppClients'));
      onClose()
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (open) return <DualOptionActionModal
    defaultOpen={true}
    onClose={onClose}
    action={(setLoading, btnRef) => generateClientRollno(setLoading, btnRef)}
    description="Are you sure to generate a new roll number for the client?"
  >
    <AlertDialogTrigger className="w-0 p-0" />
  </DualOptionActionModal>

  return <></>
}