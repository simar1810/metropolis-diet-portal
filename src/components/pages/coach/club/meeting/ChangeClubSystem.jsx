import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import ClubSystemChangeAlert from "./ClubSystemChangeAlert";
import ClubSystemConfirmation from "./ClubSystemConfirmation";
import { alertClubSystemChange } from "@/config/state-reducers/clubsystem";

function selectAlertComponent(stage) {
  switch (stage) {
    case "alert":
      return ClubSystemChangeAlert;
    case "confirmation":
      return ClubSystemConfirmation;
  }
}

export default function ChangeClubSystem({ curentClubSystem, clubSystem }) {
  const { stage, dispatch } = useCurrentStateContext();
  const Component = selectAlertComponent(stage)

  return <AlertDialog>
    <AlertDialogTrigger
      onClick={() => dispatch(alertClubSystemChange(clubSystem.id))}
      className="flex items-center gap-2"
    >
      <div className={`w-[18px] h-[18px] rounded-full ${curentClubSystem === clubSystem.id ? "bg-[var(--accent-1)] outline-2 outline-[var(--accent-1)] outline-offset-1" : "border-1"}`} />
      <p className="text-[14px]">{clubSystem.title}</p>
    </AlertDialogTrigger>
    <ClubSystemConfirmation clubSystem={clubSystem} />
  </AlertDialog>
}