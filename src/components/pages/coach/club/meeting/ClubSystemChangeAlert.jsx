import { AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { confirmClubSystemChange } from "@/config/state-reducers/clubsystem";
import { sendData } from "@/lib/api";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { toast } from "sonner";

export default function ClubSystemChangeAlert({ clubSystem }) {
  const { dispatch } = useCurrentStateContext();

  async function changeClubSystem() {
    try {
      const response = await sendData("sendOtpToUpdateClubSystem")
      if (!response.success) throw new Error(response.error || response.message);
      dispatch(confirmClubSystemChange())
    } catch (error) {
      toast.error(error.message);
    }
  }

  return <AlertDialogContent className="border-2 border-[var(--dark-1)]/25">
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        {clubSystem.message}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <Button variant="wz" onClick={changeClubSystem}>Confirm</Button>
    </AlertDialogFooter>
  </AlertDialogContent>
}