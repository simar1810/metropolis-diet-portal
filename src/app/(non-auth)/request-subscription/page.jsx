"use client";
import FormControl from "@/components/FormControl";
import { Button } from "@/components/ui/button";
import { requestSubscriptionFormControls } from "@/config/data/forms";
import { membershipState } from "@/config/state-data/request-membership";
import { membershipReducer, onChangeField } from "@/config/state-reducers/request-membership";
import { sendDataWithFormData } from "@/lib/api";
import { getObjectUrl } from "@/lib/utils";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  return <CurrentStateProvider
    state={membershipState}
    reducer={membershipReducer}
  >
    <MembershipSubscriptionContainer />
  </CurrentStateProvider>
}

const formFields = ["rollno", "name", "date", "amount", "file"]
function MembershipSubscriptionContainer() {
  const [loading, setLoading] = useState(false);
  const { dispatch, ...state } = useCurrentStateContext();

  async function requestSubscription(e) {
    const toastId = toast.loading("Please Wait...");
    try {
      setLoading(true)
      e.preventDefault();
      const data = new FormData()
      for (const name of formFields) {
        data.append(name, state[name]);
      }
      const response = await sendDataWithFormData("request-subscription", data)
      if (response.status_code !== 200) throw new Error(response.message || "Please try again later!");
      toast.success(response.message);
      dispatch({ type: "RESET_STATE" })
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      toast.dismiss(toastId);
    }
  }

  return <div className="container h-screen flex flex-col">
    <Image
      src="/wz-landscape.png"
      height={200}
      width={200}
      alt=""
      className="w-full max-h-[80px] object-left object-contain border-b-2"
    />
    <div className="max-w-[500px] w-full bg-[var(--comp-1)] py-6 px-8 mx-auto my-auto border-1 shadow-2xl rounded-[8px]">
      <h3 className="text-[24px] text-center">
        <span className="text-[var(--accent-1)]">Metro Polis</span>&nbsp;
        <span>Subscription Form</span>
      </h3>
      <form onSubmit={requestSubscription} className="mt-8">
        {requestSubscriptionFormControls.map(field => <FormControl
          key={field.id}
          className="[&_.input]:mb-4"
          value={state[field.name]}
          onChange={e => dispatch(onChangeField(field.name, e.target.value))}
          {...field}
        />)}
        {!state.file && <FormControl
          type="file"
          onChange={e => dispatch(onChangeField("file", e.target.files[0]))}
          label="Select Screenshot"
          accept="image/*"
        />}
        {state.file && <div className="relative">
          <Image
            src={getObjectUrl(state.file)}
            alt=""
            height={250}
            width={300}
            className="w-full max-h-[250px] mt-4 object-contain border-1"
          />
          <X
            className="absolute top-2 right-2 cursor-pointer"
            onClick={() => dispatch(onChangeField("file", undefined))}
          />
        </div>}
        <Button disabled={loading} className="mt-4" variant="wz">Submit</Button>
      </form>
    </div>
  </div>
}