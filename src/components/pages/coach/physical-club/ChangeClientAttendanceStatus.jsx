import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { sendData } from "@/lib/api";
import { _throwError } from "@/lib/formatter";
import { toast } from "sonner";
import { refreshAttendanceDataWithDelay, refreshClubHistoryData, refreshAttendanceData } from "@/lib/attendanceUtils";
import { mutate } from "swr";
import { format } from "date-fns";

export default function ChangeClientAttendanceStatus({
  children,
  clientId,
  status,
  date,
  servingNumber,
}) {
  const clearAbsentStatus = async (clientId, date) => {
    try {
      // Format the date properly for the API
      const formattedDate = typeof date === 'string' ? date : date.toISOString();

      // Clear absent status by setting it to unmarked
      const requestData = {
        clientId: clientId,
        date: formattedDate,
        status: "unmarked",
        person: "coach"
      };

      const response = await sendData(
        "app/physical-club/attendance?person=coach",
        requestData,
        "PUT"
      );

      if (response.status_code !== 200) throw new Error(response.message);
    } catch (error) {
      // Don't show error toast for this, as it's a background operation
    }
  };

  async function changeClientAttendanceStatus(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const requestData = {
        clientId,
        status,
        date,
        servingNumber,
      };

      const response = await sendData(
        "app/physical-club/attendance?person=coach",
        requestData,
        "PUT"
      );
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message || "Successfully changed the attendance status");
      mutate("app/physical-club/attendance");
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <DualOptionActionModal
    description={`You are changing the attendance status to ${status} for ${format(new Date(date), "dd-MM-yyyy")}.`}
    action={(setLoading, btnRef) => changeClientAttendanceStatus(setLoading, btnRef)}
  >
    <AlertDialogTrigger asChild>
      {children}
    </AlertDialogTrigger>
  </DualOptionActionModal>
}