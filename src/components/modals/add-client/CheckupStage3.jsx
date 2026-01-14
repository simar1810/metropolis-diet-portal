import FormControl from "@/components/FormControl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { changeFieldvalue, changeNextFollowUpType, createdClient, generateRequestPayload, setCurrentStage } from "@/config/state-reducers/add-client-checkup";
import { sendDataWithFormData } from "@/lib/api";
import { _throwError } from "@/lib/formatter";
import { getObjectUrl } from "@/lib/utils";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";

export default function CheckupStage3() {
  const { dispatch, file, ...state } = useCurrentStateContext();
  async function createClient() {
    try {
      const data = generateRequestPayload({ ...state, file }, undefined, state.existingClientID);
      const response = await sendDataWithFormData("app/createClient", data);
      if (response.status_code !== 200) throw new Error(response.message || "Please try again later!");
      toast.success(response.message);
      dispatch(createdClient(response.data.clientId));
      mutate((key) => typeof key === 'string' && key.startsWith('getAppClients'));
    } catch (error) {
      toast.error(error.message);
    }
  }

  return <div className="px-6 py-4">
    <div className="relative w-24 h-24 rounded-full border-2 border-green-500 flex items-center justify-center mb-4 mr-[500px]">
      <img
        src={getObjectUrl(file) || "/not-found.png"}
        alt="Profile"
        className="w-full h-full rounded-full object-cover"
      />
      <label className="absolute bottom-0 right-0 bg-[var(--accent-1)] p-1 rounded-full cursor-pointer">
        <Camera size={16} color="white" />
        <input type="file" className="hidden" onChange={e => dispatch(changeFieldvalue("file", e.target.files[0]))} />
      </label>
    </div>

    <div className="w-full flex flex-col md:flex-row gap-4 mb-4">
      <div className="w-full">
        <p className="text-[10px] font-semibold">
          Mobile Number(optional)
        </p>
        <input
          placeholder="Mobile Number"
          value={state.mobileNumber}
          onChange={e => dispatch(changeFieldvalue("mobileNumber", e.target.value))}
          type="number"
          className="flex-1 border rounded p-2 text-sm w-full"
        />
      </div>
      <div className="w-full">
        <p className="text-[10px] font-semibold"> Email(optional)</p>
        <input
          type="email"
          placeholder="Email ID"
          value={state.email}
          onChange={e => dispatch(changeFieldvalue("email", e.target.value))}
          className="flex-1 border rounded p-2 text-sm w-full"
        />
      </div>
    </div>

    <div className="w-full mt-5">
      <p className="w-full font-semibold text-[10px]">
        Notes for Client(Optional)
      </p>
      <Textarea
        placeholder="Add Notes for this Client"
        className="w-full border rounded p-2 text-sm min-h-[100px] mb-4"
        value={state.notes}
        onChange={e => dispatch(changeFieldvalue("notes", e.target.value))}
      />
    </div>

    <div className="w-full flex flex-col md:flex-row justify-between gap-4 mb-4">
      <div className="flex flex-col gap-2">
        <p className="text-[12px]">
          Remind yourself when you are meeting this client next time
        </p>
        <div className="flex gap-4">
          <label className="flex items-center gap-1 text-sm">
            <input
              onChange={e => dispatch(changeNextFollowUpType())}
              checked={state.nextFollowupType === "8-day"}
              type="radio"
            />
            8 Day
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input
              onChange={e => dispatch(changeFieldvalue("nextFollowupType", "custom"))}
              checked={state.nextFollowupType === "custom"}
              type="radio"
            />
            Custom
          </label>
        </div>
        {state.nextFollowupType === "custom" && <FormControl
          value={state.followUpDate}
          onChange={e => dispatch(changeFieldvalue("followUpDate", e.target.value))}
          type="date"
        />}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[12px]">
          Select if client is your lead (Inactive) or Customer (Active)
        </p>
        <div className="flex gap-4">
          <label className="flex items-center gap-1 text-sm">
            <input
              onChange={e => dispatch(changeFieldvalue("activeType", "active"))}
              checked={state.activeType === "active"}
              type="radio"
            />
            Active
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input
              onChange={e => dispatch(changeFieldvalue("activeType", "inactive"))}
              checked={state.activeType === "inactive"}
              type="radio"
            />
            Inactive
          </label>
        </div>
      </div>
    </div>
    <div className="mt-6 flex items-center gap-4">
      <Button variant="wz_outline" className="grow" onClick={() => dispatch(setCurrentStage(2))}>Previous</Button>
      <Button
        variant="wz"
        onClick={createClient}
        className="grow"
      >
        Save
      </Button>
    </div>
  </div>
}