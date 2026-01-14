'use client';
import Image from "next/image";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import { getClientNextMarathonClient, getMarathonLeaderBoard, getMarathons } from "@/lib/fetchers/app";
import useSWR, { mutate, useSWRConfig } from "swr";
import FormControl from "@/components/FormControl";
import { ArrowLeft, Eye, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { nameInitials } from "@/lib/formatter";
import { useState } from "react";
import AssignMarathonModal from "@/components/modals/app/AssignMarathonModal";
import CreateMarathonModal from "@/components/modals/app/CreateMarathonModal";
import { DialogTrigger } from "@/components/ui/dialog";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { sendData } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

export default function Page() {
  const { isLoading, error, data } = useSWR(
    "client/marathon",
    () => getClientNextMarathonClient(format(new Date(), "dd-MM-yyyy")))
  const [selectedMarathonId, setSelectedMarathonId] = useState("");

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />
  const marathons = data.data;

  return <div className="grid items-start gap-8">
    <SelectedMarathonDetails
      setSelectedMarathonId={setSelectedMarathonId}
      marathon={marathons?.at(0)}
    />
  </div>
}


function SelectedMarathonDetails({ marathon }) {
  if (!marathon) return <div className="content-container">
    <ContentError
      className="border-0"
      title="Select a marathon to see details"
    />
  </div>
  return <div className="content-container">
    <div className="flex items-center gap-4">
      <h4 className="leading-[1] mb-4 mr-auto">{marathon?.marathonTitle}</h4>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
      {marathon.tasks.map(task => <div className="mb-4 p-4 flex items-center gap-4 border-1 rounded-[10px]" key={task.taskId}>
        <div>
          <h3 className="text-base">{task.title}</h3>
          <p className="text-[var(--dark-1)]/32 text-[14px] font-[500] mt-1">{task.description}</p>
          {task.photoSubmission && <p className="text-[var(--dark-1)]/25 text-[14px] italic mt-4">* Photo required at Submission</p>}
          {task.videoSubmission && <p className="text-[var(--dark-1)]/25 text-[14px] italic">* Video required at Submission</p>}
        </div>
        <Image
          src="/svgs/marathon.svg"
          alt=""
          width={500}
          height={500}
          className="max-w-20 ml-auto object-contain"
        />
      </div>)}
    </div>
  </div>
}