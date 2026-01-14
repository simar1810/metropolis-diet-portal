import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader
} from "@/components/ui/card";
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger
} from "@/components/ui/menubar";
import {
  ChevronDown,
  Copy,
  EllipsisVertical,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { nameInitials } from "@/lib/formatter";
import { clientPortfolioFields } from "@/config/data/ui";
import UpdateClientGoalModal from "@/components/modals/client/UpdateClientGoalModal";
import UpdateClientDetailsModal from "@/components/modals/client/UpdateClientDetailsModal";
import DeleteClientModal from "@/components/modals/client/DeleteClientModal";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { fetchData, sendData } from "@/lib/api";
import FollowUpModal from "@/components/modals/client/FollowUpModal";
import UpdateClientNotesModal from "@/components/modals/client/UpdateClientNotesModal";
import { useRef, useState } from "react";
import EditClientRollnoModal from "@/components/modals/client/EditClientRollnoModal";
import useClickOutside from "@/hooks/useClickOutside";
import { useAppSelector } from "@/providers/global/hooks";
import { permit } from "@/lib/permit";
import { generateWeightStandard } from "@/lib/client/statistics";
import ClientUpdateCategories from "./ClientUpdateCategories";
import { notesColors } from "@/config/data/other-tools";
import { Badge } from "@/components/ui/badge";
import ClientNudges from "./ClientNudges";
import { extractNumber } from "@/lib/utils";
import Loader from "@/components/common/Loader";
import EditClientPreferences from "./EditClientPreferences";

export default function ClientDetailsCard({ clientData }) {
  return <div>
    <ClientDetails clientData={clientData} />
    <ClientNudges />
  </div>
}

function findClientLatestWeight(matrices = []) {
  const lastIndex = findClientLatestWeight.length - 1;
  return `${extractNumber(matrices?.at(lastIndex)?.weight)} ${matrices?.at(lastIndex)?.weightUnit}`
}

function ClientDetails({ clientData }) {
  const { activity_doc_ref: activities } = clientData;
  async function sendAnalysis() {
    try {
      const response = await sendData(`app/requestFollowUpRequest?clientId=${clientData?.clientId}`);
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message || "Please try again later!");
    }
  }
  const clienthealthMatrix = clientData?.healthMatrix?.healthMatrix || [{}]
  const healthMatricesLength = clienthealthMatrix.length
    ? false
    : (generateWeightStandard(clienthealthMatrix?.at(0)) - generateWeightStandard(clienthealthMatrix?.at(healthMatricesLength - 1)))
      .toFixed(2)

  const latestWeight = findClientLatestWeight(clienthealthMatrix)

  return <Card className="bg-white rounded-[18px] shadow-none w-[90vw] md:w-auto">
    <Header clientData={clientData} />
    <CardContent>
      {/* <div className="flex items-center justify-between">
        <h4>Goal</h4>
        <UpdateClientGoalModal
          id={clientData._id}
          clientData={clientData}
        />
      </div> */}
      {/* <p className="text-[14px] text-[var(--dark-2)] leading-[1.3] mt-2 mb-4">{clientData.goal}</p>
      <ClientCategoriesList clientData={clientData} /> */}
      {/* <div className="flex items-center justify-between">
        <h4>Notes</h4>
        <UpdateClientNotesModal
          id={clientData._id}
          defaultValue={clientData.notes}
        />
      </div> */}
      <p className="text-[14px] text-[var(--dark-2)] leading-[1.3] mt-2">{clientData.notes}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <FollowUpModal clientData={clientData} />
        {/* <Button onClick={sendAnalysis} variant="wz" className="w-full mx-auto block text-xs">Analysis Reminder</Button> */}
      </div>
      {Boolean(activities) && <ClientActivities activities={activities} />}
      <div className="mt-4 flex items-center justify-between">
        <h4>Personal Information</h4>
        <UpdateClientDetailsModal clientData={clientData} />
      </div>
      <div className="mt-4 pl-4">
        {clientPortfolioFields.map(field => <div
          key={field.id}
          className="text-[13px] mb-1 grid grid-cols-4 items-center gap-2"
          {...field}
        >
          <p>{field.title}</p>
          <p className="text-[var(--dark-2)] col-span-2">:&nbsp;{clientData[field.name]}</p>
        </div>)}
        {/* {weightLoss && <div className="text-[13px] mb-1 grid grid-cols-4 items-center gap-2">
          <p>Weight Lost Till Date</p>
          <p className="text-[var(--dark-2)] col-span-2">:&nbsp;{weightLoss * -1} Pounds</p>
        </div>} */}
        {clientData?.healthMatrix?.height && <div className="text-[13px] mb-1 grid grid-cols-4 items-center gap-2">
          <p>Height</p>
          <p className="text-[var(--dark-2)] col-span-2">:&nbsp;{`${clientData?.healthMatrix?.height} ${clientData?.healthMatrix?.heightUnit}`}</p>
        </div>}
        {/* {latestWeight && <div className="text-[13px] mb-1 grid grid-cols-4 items-center gap-2">
          <p>Latest Weight</p>
          <p className="text-[var(--dark-2)] col-span-2">:&nbsp;{latestWeight}</p>
        </div>} */}
      </div>
      <ClientPreferencesDietEngine clientData={clientData} />
    </CardContent>
  </Card>
}

function ClientActivities({ activities }) {
  return <div className="mt-4 p-4 rounded-[10px] border-1">
    <div className="font-semibold pb-2 flex items-center gap-6 border-b-1">
      <div>
        <p className="text-[var(--accent-1)]">{activities.dailyActivities.reduce((acc, activity) => acc + activity.steps, 0)}</p>
        <p>Steps</p>
      </div>
      <div>
        <p className="text-[var(--accent-1)]">{activities.dailyActivities.reduce((acc, activity) => acc + activity.calories, 0).toFixed(2)}</p>
        <p>Calories</p>
      </div>
      <Image
        src="/svgs/circle-embedded.svg"
        height={64}
        width={64}
        alt=""
        className="ml-auto"
      />
    </div>
    <p className="text-[var(--dark-1)]/25 text-[12px] font-semibold mt-2">Last 7 Days</p>
  </div>
}

function Header({ clientData }) {
  const [modalOpened, setModalOpened] = useState(false);
  const { roles, coachRefUrl } = useAppSelector(state => state.coach.data)

  const dropdownRef = useRef(null);
  useClickOutside(dropdownRef, () => setModalOpened(false));

  async function generateClientRollno(setLoading) {
    try {
      setLoading(true)
      const response = await sendData(`edit-rollno?id=${clientData._id}`, { clientId: clientData._id });
      if (!response.success) throw new Error(response.message);
      toast.success(response.message);
      mutate(`clientDetails/${clientData._id}`);
      setModalOpened(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  function copyLoginLink() {
    const loginLink = `${coachRefUrl}/loginClient?clientID=${clientData.clientId}`;
    navigator.clipboard.writeText(loginLink)
      .then(() => {
        toast.success("Login link copied to clipboard!");
        setModalOpened(false);
      })
      .catch(() => {
        toast.error("Failed to copy login link");
      });
  }

  return <CardHeader className="relative flex items-center gap-4 md:gap-8">
    <Avatar className="w-[80px] h-[80px] md:w-[100px] md:h-[100px]">
      <AvatarImage src={clientData.profilePhoto} />
      <AvatarFallback>{nameInitials(clientData.name)}</AvatarFallback>
    </Avatar>
    <div className="">
      <h3 className="mb-2">{clientData.name}</h3>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <p className="text-[14px] text-[var(--dark-2)] font-semibold leading-[1]">ID #{clientData.clientId}</p>
        {/* <div className="px-2 flex items-center gap-2 cursor-pointer" onClick={copyLoginLink}>
          <Copy strokeWidth="3" className="w-[14px] h-[14px] text-[var(--accent-1)]" />
        </div> */}
        <div className="w-1 h-full bg-[var(--dark-1)]/50"></div>
        {clientData.rollno && permit("club", roles) && <EditClientRollnoModal
          defaultValue={clientData.rollno}
          _id={clientData._id}
        />}
      </div>
      {/* <div className="flex gap-4">
        <ClientStatus
          status={clientData.isActive}
          _id={clientData._id}
        />
        {permit("club", roles) && <ClientClubStatus
          status={clientData.isSubscription}
          _id={clientData._id}
        />}
      </div> */}
    </div>
    {/* <DropdownMenu open={modalOpened}>
      <DropdownMenuTrigger onClick={() => setModalOpened(true)} asChild className="!absolute top-0 right-4">
        <EllipsisVertical className="cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent ref={dropdownRef} className="text-[14px] font-semibold">
        <DropdownMenuItem>
          <DeleteClientModal
            onClose={() => setModalOpened(false)}
            _id={clientData._id}
          />
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ClientUpdateCategories
            onClose={() => setModalOpened(false)}
            clientData={clientData}
          />
        </DropdownMenuItem>
        {!Boolean(clientData.rollno) && permit("club", roles) && <DropdownMenuItem>
          <DualOptionActionModal
            action={(setLoading, btnRef) => generateClientRollno(setLoading, btnRef, false)}
            description="Are you sure to generate a new roll number for the client?"
            onClose={() => setModalOpened(false)}
          >
            <AlertDialogTrigger className="font-semibold text-[var(--accent-1)] px-2 flex items-center gap-2">
              <Plus strokeWidth="3" className="w-[20px] h-[20px] text-[var(--accent-1)]" />
              Generate Roll Number
            </AlertDialogTrigger>
          </DualOptionActionModal>
        </DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu> */}
  </CardHeader>
}

function ClientStatus({
  status,
  _id
}) {
  async function changeStatus(
    setLoading,
    closeBtnRef,
    status
  ) {
    try {
      setLoading(true);
      const response = await sendData(`app/updateClientActiveStatus?id=${_id}&status=${status}`, {}, "PUT");
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      mutate(`clientDetails/${_id}`);
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }
  return <Menubar className="p-0 border-0 shadow-none">
    <MenubarMenu className="p-0">
      <MenubarTrigger className={`${status ? "bg-[var(--accent-1)] hover:bg-[var(--accent-1)]" : "bg-[var(--accent-2)] hover:bg-[var(--accent-2)]"} text-white font-bold py-[4px] md:py-[2px] px-2 text-[10px] md:text-[12px] gap-1`}>
        {status ? <>Active</> : <>In Active</>}
        <ChevronDown className="w-[18px]" />
      </MenubarTrigger>
      <MenubarContent sideOffset={10} align="center">
        {status
          ? <DualOptionActionModal
            description="Are you sure to change the status of the client"
            action={(setLoading, btnRef) => changeStatus(setLoading, btnRef, false)}
          >
            <AlertDialogTrigger className="font-semibold text-[14px] text-[var(--accent-2)] pl-4 py-1 flex items-center gap-2">Inactive</AlertDialogTrigger>
          </DualOptionActionModal>
          : <DualOptionActionModal
            description="Are you sure to change the status of the client"
            action={(setLoading, btnRef) => changeStatus(setLoading, btnRef, true)}
          >
            <AlertDialogTrigger className="font-semibold text-[14px] text-[var(--accent-1)] pl-4 py-1 flex items-center gap-2">Active</AlertDialogTrigger>
          </DualOptionActionModal>}
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
}


function ClientClubStatus({
  status,
  _id
}) {
  async function changeStatus(
    setLoading,
    closeBtnRef,
    status
  ) {
    try {
      setLoading(true);
      const response = await sendData(`updateClubClientStatus?id=${_id}&status=${status}`, {}, "PUT");
      if (!Boolean(response.data)) throw new Error(response.message);
      toast.success(response.message);
      mutate(`clientDetails/=${_id}`);
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <Menubar className="p-0 border-0 shadow-none">
    <MenubarMenu className="p-0">
      <MenubarTrigger className={`${status ? "bg-[var(--accent-1)] hover:bg-[var(--accent-1)]" : "bg-[var(--accent-2)] hover:bg-[var(--accent-2)]"} text-white font-bold py-[4px] md:py-[2px] px-2 text-[10px]  md:text-[12px] gap-1`}>
        {status ? <>Membership On</> : <>Membership Off</>}
        <ChevronDown className="w-[18px]" />
      </MenubarTrigger>
      <MenubarContent sideOffset={10} align="center">
        {status
          ? <DualOptionActionModal
            description="Are you sure to change the status of the client"
            action={(setLoading, btnRef) => changeStatus(setLoading, btnRef, false)}
          >
            <AlertDialogTrigger className="font-semibold text-[14px] text-[var(--accent-2)] pl-4 py-1 flex items-center gap-2">Membership Off</AlertDialogTrigger>
          </DualOptionActionModal>
          : <DualOptionActionModal
            description="Are you sure to change the membership status of the client"
            action={(setLoading, btnRef) => changeStatus(setLoading, btnRef, true)}
          >
            <AlertDialogTrigger className="font-semibold text-[14px] text-[var(--accent-1)] pl-4 py-1 flex items-center gap-2">Membership On</AlertDialogTrigger>
          </DualOptionActionModal>}
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
}

function ClientCategoriesList({ clientData }) {
  const { client_categories = [] } = useAppSelector(state => state.coach.data)
  const set = new Set(clientData.categories)
  const selectedCategories = client_categories.filter(category => set.has(category._id))
  return <div className="my-8">
    <div className="flex items-center justify-between">
      <h4>Categories</h4>
      <ClientUpdateCategories clientData={clientData} />
    </div>
    <div className="mt-2 flex flex-wrap items-center gap-1">
      {selectedCategories.map((category, index) => <Badge
        key={category._id}
        style={{
          backgroundColor: notesColors[index % 5],
          color: "#000000",
          fontWeight: "bold"
        }}
      >
        {category.name}
      </Badge>)}
    </div>
  </div>
}

function camelToTitleCase(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, char => char.toUpperCase())
    .trim();
}

function ClientPreferencesDietEngine({ clientData }) {
  const { isLoading, data, error } = useSWR(
    `app/metropolis/customer/${clientData.metropolisPid}`,
    () => fetchData(`app/metropolis/customer/relation?clientId=${clientData.metropolisPid}`)
  )

  if (isLoading) return <div className="border-1 bg-[var(--comp-1)] flex items-center justify-center h-[80px]">
    <Loader />
  </div>

  if (error || data?.status_code !== 200) return <div className="border-1 text-red-600 bg-[var(--comp-1)] flex items-center justify-center h-[80px]">
    {error?.message || data?.message || "Something went wrong"}
  </div>

  const preferences = data.data?.preferences || {}
  const keys = Object.keys(preferences || {})

  return <div>
    <div className="flex items-center justify-between">
      <h4 className="mt-8 mb-2 px-4">Client Preferences</h4>
      <EditClientPreferences clientId={clientData.metropolisPid} clientPreferences={preferences} />
    </div>
    <div className="px-4">
      {keys
        .filter(key => !["not specified", "unknown"].includes(preferences[key].toLowerCase()))
        .map(key => <div
          key={key}
          className="text-[13px] mb-1 flex items-center gap-x-2"
        >
          <p className="max-w-[20ch] w-full">{camelToTitleCase(key)}</p>
          <p className="text-[var(--dark-2)] col-span-2">:&nbsp;{preferences[key]}</p>
        </div>)}
    </div>
  </div>
}