import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addClientCheckupReducer, init } from "@/config/state-reducers/add-client-checkup";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import CheckupStage1 from "../add-client/CheckupStage1";
import CheckupStage2 from "../add-client/CheckupStage2";
import CheckupStage3 from "../add-client/CheckupStage3";
import ClientCreatedNotify from "../add-client/ClientCreatedNotify";
import { useEffect, useState } from "react";
import ContentLoader from "@/components/common/ContentLoader";
import { toast } from "sonner";
import { fetchData } from "@/lib/api";
import OnBoardingQuestionaire from "./OnBoardingQuestionaire";

export default function AddClientWithCheckup({ children, type, data, setModal }) {
  const [dataGenerated, setDataGenerated] = useState(false);
  const [initialState, setInitialState] = useState(() => data)

  useEffect(function () {
    if (!dataGenerated) {
      if (Boolean(data?._id)) {
        ; (async function () {
          try {
            const response = await fetchData(`app/clientProfile?id=${data._id}`);
            if (response.status_code !== 200) throw new Error(response.message);
            setInitialState(prev => ({
              ...prev,
              mobileNumber: response.data.mobileNumber,
              clientId: response.data.clientId,
              dob: response.data.dob
            }))
            setDataGenerated(true);
          } catch (error) {
            toast.error(error.message || "Please try again later!");
          }
        })();
      } else {
        setDataGenerated(true);
      }
    }
  }, []);

  if (!dataGenerated) return <Dialog open={true} onOpenChange={() => setModal()}>
    <DialogContent className="!max-w-[800px] max-h-[85vh] h-full border-0 p-0 overflow-y-auto block">
      <DialogTitle />
      <ContentLoader />
    </DialogContent>
  </Dialog>

  return <Dialog open={true} onOpenChange={() => setModal()}>
    {children}
    {!children && <DialogTrigger />}
    <CurrentStateProvider
      state={init(type, initialState)}
      reducer={addClientCheckupReducer}
    >
      <AddClientCheckupContainer />
    </CurrentStateProvider>
  </Dialog>
}

function AddClientCheckupContainer() {
  const { stage } = useCurrentStateContext();
  const Component = selectComponent(stage)

  return <DialogContent className="w-[600px] md:!max-w-[800px] max-h-[85vh] h-full border-0 p-0 overflow-y-auto block">
    <DialogHeader className="!p-0 !h-auto border-b-2 border-[var(--dark-1)]/25 z-[100]">
      <DialogTitle className="bg-white p-4 text-left text-black text-lg font-semibold ">
        Client Details
      </DialogTitle>
    </DialogHeader>
    <div className="grow px-4">
      <Component />
    </div>
  </DialogContent>
}

function selectComponent(stage) {
  switch (stage) {
    case 1:
      return CheckupStage1;
    case 2:
      return CheckupStage2;
    case 3:
      return CheckupStage3;
    case 4:
      return OnBoardingQuestionaire
    case 5:
      return ClientCreatedNotify;
    default:
      return () => <></>
  }
}