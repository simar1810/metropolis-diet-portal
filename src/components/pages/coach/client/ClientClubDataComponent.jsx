import { TabsContent } from "@/components/ui/tabs";
import VolumePointHistory from "./VolumePointHistory";
import SubscriptionHistory from "./SubscriptionHistory";
import AttendanceRecord from "./AttendanceRecord";
import DualOptionActionModal from "@/components/modals/DualOptionActionModal";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { mutate } from "swr";
import { toast } from "sonner";
import { sendData } from "@/lib/api";
import { useAppSelector } from "@/providers/global/hooks";
import { permit } from "@/lib/permit";

export default function ClientClubDataComponent({ onSubmit = () => { }, mutateQuery, clientData }) {
  const { roles, clubSystem } = useAppSelector(state => state.coach.data);
  async function generateClientRollno(setLoading, closeBtnRef) {
    try {
      setLoading(true);
      const response = await sendData(`edit-rollno?id=${clientData._id}`, { clientId: clientData._id });
      if (!response.success) throw new Error(response.message);
      toast.success(response.message);
      mutate(`clientDetails/${clientData._id}`);
      onSubmit()
      closeBtnRef.current.click();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!permit("club", roles)) return <TabsContent value="club">
    <Image
      src="/illustrations/club.svg"
      alt=""
      height={305}
      width={305}
      className="max-w-[300px] h-full w-full mx-auto object-contain"
    />
    <h5 className="text-center">This feature is only available with premium subscription</h5>
    <Button variant="wz" className="mt-4 mb-20 mx-auto block">Add Subscription</Button>
  </TabsContent>

  if (!clientData.rollno && permit("club", roles)) return <TabsContent value="club">
    <div className="h-[400px] flex items-center justify-center">
      <DualOptionActionModal
        action={(setLoading, btnRef) => generateClientRollno(setLoading, btnRef, false)}
        description="Are you sure to generate a new roll number for the client?"
      >
        <AlertDialogTrigger className="font-semibold text-[var(--primary-1)] bg-[var(--accent-1)] px-4 py-2 rounded-[8px]">
          Generate Roll Number
        </AlertDialogTrigger>
      </DualOptionActionModal>
    </div>
  </TabsContent>

  return <TabsContent value="club">
    {clubSystem === 2 && <VolumePointHistory _id={clientData._id} />}
    {[0, 1].includes(clubSystem) && <SubscriptionHistory _id={clientData._id} clientData={clientData} />}
    <AttendanceRecord _id={clientData._id} />
  </TabsContent>
}