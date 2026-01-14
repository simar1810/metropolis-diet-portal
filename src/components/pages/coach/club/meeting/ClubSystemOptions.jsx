import { clubSystemInitialState, clubSystemData } from "@/config/state-data/clubsystem";
import { clubSystemReducer } from "@/config/state-reducers/clubsystem";
import { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { useAppSelector } from "@/providers/global/hooks";
import ChangeClubSystem from "./ChangeClubSystem";

export default function ClubSystemOptions() {
  const curentClubSystem = useAppSelector(state => state.coach.data?.clubSystem);

  return <CurrentStateProvider
    state={clubSystemInitialState}
    reducer={clubSystemReducer}
  >
    <div value={curentClubSystem} className="flex items-center gap-8">
      {clubSystemData.map(clubSystem => <div key={clubSystem.id} className="flex items-center space-x-2">
        <ChangeClubSystem curentClubSystem={curentClubSystem} clubSystem={clubSystem} />
      </div>)}
    </div>
  </CurrentStateProvider>
}