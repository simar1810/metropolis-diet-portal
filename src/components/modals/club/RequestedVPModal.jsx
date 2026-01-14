import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import ReviewVPModal from "./ReviewVPModal";
import useSWR from "swr";
import { getRequestVolumePoints } from "@/lib/fetchers/club";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";

export default function RequestedVPModal() {
  const { isLoading, error, data } = useSWR("getRequestVolumePoints", () => getRequestVolumePoints())

  if (isLoading) return <></>

  const vps = data.data;

  return <Dialog>
    <DialogTrigger className="h-8 px-4 py-2 text-[10px] md:text-[14px] has-[>svg]:px-3 bg-[var(--accent-1)] text-white hover:bg-[var(--accent-1)] font-semibold rounded-[8px]">
      Requested Volume Points
    </DialogTrigger>
    <DialogContent className="!max-w-[450px] max-h-[65vh] text-center border-0 px-0 overflow-auto gap-0">
      {data.status_code !== 200 || error && <>
        <DialogTitle className="text-[24px] mb-0">Error</DialogTitle>
        <ContentError title={error || data.message} className="!min-h-[200px] border-0" />
      </>}
      {data.status_code === 200 && !error && <>
        <DialogTitle className="text-[24px]">Requested Volume Points</DialogTitle>
        {vps.map(vp => <RequestVolumePointCard
          vp={vp}
          key={vp._id}
        />)}
      </>}
      {vps.length === 0 && <div className="text-[var(--dark-1)]/50 mb-4">
        <ContentError title="No Volume Points Requested!" className="!min-h-[200px] border-0" />
      </div>}
    </DialogContent>
  </Dialog >
}

function RequestVolumePointCard({ vp }) {
  return <div className="mx-4 py-4 flex items-start gap-4 border-b-1">
    <Avatar className="w-[50px] h-[50px]">
      <AvatarImage src={vp?.clientId?.profilePhoto} />
      <AvatarFallback>SN</AvatarFallback>
    </Avatar>
    <div>
      <p>New Name requested to Update Volume Points</p>
      <div className="text-[14px] text-[var(--dark-1)]/50 mb-3 flex gap-4">
        <div>Roll No: {vp?.clientId?.rollno}</div>
        <div>Points: {vp?.points}</div>
        <div>Date {vp?.date}</div>
      </div>
      <ReviewVPModal vp={vp} />
    </div>
  </div>
}