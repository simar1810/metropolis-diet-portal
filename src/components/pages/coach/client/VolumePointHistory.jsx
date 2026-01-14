import ContentError from "@/components/common/ContentError";
import Loader from "@/components/common/Loader";
import AddVolumePointsModal from "@/components/modals/club/AddVolumePointsModal";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ddMMyyyy } from "@/config/data/regex";
import { sendData } from "@/lib/api";
import { getClientVolumePoints } from "@/lib/fetchers/club";
import { format, parse } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

function formatVPDate(date) {
  if (ddMMyyyy.test(date)) return format(
    parse(date, "dd-MM-yyyy", new Date()),
    "dd-MM-yyyy"
  )

  if (!isNaN(Date.parse(date))) return format(
    new Date(date),
    "dd-MM-yyyy"
  )
}

export default function VolumePointHistory({ _id }) {
  const { isLoading, error, data } = useSWR(`getClientVolumePoints/${_id}`, () => getClientVolumePoints(_id));

  async function deleteVolumePoints(setLoading, closeBtnRef, id) {
    try {
      setLoading(true);
      const response = await sendData(`deleteVolumePoints?id=${data.data._id}&index=${id}`, { index: id }, "DELETE");
      if (!response.success) throw new Error(response.message);
      toast.success(response.message);
      mutate(`getClientVolumePoints/${_id}`);
      mutate(`clientDetails/${_id}`)
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) return <div className="h-[200px] flex items-center justify-center">
    <Loader />
  </div>

  const volumePoints = data?.data;
  const memberships = volumePoints?.pointsHistory || [];

  if (memberships?.length === 0 || data?.message === "Invalid ClientId OR CoachId") return <div className="mb-8">
    <div className="flex items-center justify-between">
      <h5>Membership History</h5>
      <AddVolumePointsModal _id={_id} />
    </div>
    <ContentError className="!min-h-[200px] mt-4 mb-8" title="This client has 0 subscriptions" />
  </div>

  if (error || !data.success) return <ContentError title={error || data?.message} />

  return <div className="mb-8 w-[87vw] overflow-x-auto no-scrollbar md:w-auto">
    <div className="flex items-center justify-between">
      <h5>Membership History</h5>
      <AddVolumePointsModal _id={_id} />
    </div>
    <Table className="bordered-table mt-4 [&_th]:font-bold">
      <TableHeader>
        <TableRow className="[&_th]:text-center">
          <TableHead>Sr No.</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Points</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {memberships.map((record, index) => <TableRow key={index}>
          <TableCell>{index + 1}</TableCell>
          <TableCell>{formatVPDate(record.date)}</TableCell>
          <TableCell>{record.points}</TableCell>
          <TableCell>
            <DualOptionActionModal
              action={(setLoading, closeBtnRef) => deleteVolumePoints(setLoading, closeBtnRef, index)}
              description="Are you sure to delete this record?"
            >
              <AlertDialogTrigger>
                <Trash2 className="w-[16px] h-[16px] text-[var(--accent-2)]" />
              </AlertDialogTrigger>
            </DualOptionActionModal>
          </TableCell>
        </TableRow>)}
      </TableBody>
    </Table>
  </div>
}