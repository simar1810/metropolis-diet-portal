import FormControl from "@/components/FormControl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { quickAddClientFormFields } from "@/config/data/ui";
import { quickAddInitialState } from "@/config/state-data/quick-add";
import { changeFieldvalue, quickAddClientCreated, quickAddReducer } from "@/config/state-reducers/quick-add";
import { sendData } from "@/lib/api";
import { copyText } from "@/lib/utils";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { useAppSelector } from "@/providers/global/hooks";
import { CircleCheckBig, Copy } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function QuickAddClient({ client, setModal }) {
  return <Dialog open={true} onOpenChange={() => setModal()}>
    <DialogTrigger />
    <DialogContent className="!max-w-[400px] max-h-[70vh] border-0 p-0 overflow-y-auto">
      <DialogHeader className="p-4 border-b-1">
        <DialogTitle className="">
          Quick Add Client
        </DialogTitle>
      </DialogHeader>
      <CurrentStateProvider
        state={quickAddInitialState}
        reducer={quickAddReducer}
      >
        <QuickAddClientContainer />
      </CurrentStateProvider>
    </DialogContent>
  </Dialog>
}

function QuickAddClientContainer() {
  const { view } = useCurrentStateContext();
  if (view === 1) return <FormContainer />
  return <SuccessClientCreated />
}
function FormContainer() {
  const { dispatch, ...state } = useCurrentStateContext();

  const coachId = useAppSelector(state => state.coach.data.coachId);

  async function quickAddClient() {
    try {
      const data = {
        name: state.name,
        mobileNumber: state.mobileNumber,
        coachID: coachId
      }
      const response = await sendData("app/request-client", data);
      if (response.status_code !== 200) throw new Error(response.message || "Please try again later!");
      toast.success(response.message);
      dispatch(quickAddClientCreated(response?.data?.clientId))
      mutate((key) => typeof key === 'string' && key.startsWith('getAppClients'));
    } catch (error) {
      toast.error(error.message);
    }
  }

  return <div className="px-4">
    {quickAddClientFormFields.map(field => <FormControl
      key={field.id}
      value={state[field.name]}
      onChange={e => dispatch(changeFieldvalue(field.name, e.target.value))}
      className="[&_.label]:text-[14px] [&_.label]:font-[400] block mb-2"
      {...field}
    />)}
    <Button
      variant="wz"
      className="block mt-20 mb-4 mx-auto"
      onClick={quickAddClient}
    >
      Save
    </Button>
  </div>
}

function SuccessClientCreated() {
  const { clientId } = useCurrentStateContext();
  const { coachRefUrl = "https://wellnessz.in/app" } = useAppSelector(state => state.coach.data);
  const clientLink = `${coachRefUrl}/loginClient?clientID=${clientId}`
  return <div className="px-4">
    <CircleCheckBig className="static w-[120px] h-[120px] text-[var(--accent-1)] aspect-square mx-auto" />
    <h4 className="text-[var(--accent-1)] text-center mb-4">Client Added successfully!</h4>
    <p className="text-[var(--dark-1)]/35 text-[14px] text-center">Your Client Account has been created</p>
    <p className="text-[var(--dark-1)]/35 text-[14px] text-center">with Client ID #{clientId}</p>
    <p className="font-bold mt-12">Client Link</p>
    <div className="mb-8 flex border-1 rounded-[8px] overflow-clip">
      <p className="grow px-4 py-2">{clientLink}</p>
      <button
        className="bg-[var(--accent-1)] aspect-square px-2 cursor-pointer"
        onClick={() => {
          copyText(clientLink)
          toast.success("Link Copied!");
        }}
      >
        <Copy className="text-white mt-2" />
      </button>
    </div>
  </div>
}