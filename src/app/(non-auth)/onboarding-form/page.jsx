"use client";
import FormControl from "@/components/FormControl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onboardingFormInitialState } from "@/config/state-data/onboarding-form";
import { changeFieldvalue, clientCreated, onboardingFormReducer } from "@/config/state-reducers/onboarding-form";
import { sendData, sendDataWithFormData } from "@/lib/api";
import { generateMeetingBaseLink, getObjectUrl } from "@/lib/utils";
import useCurrentStateContext, { CurrentStateProvider } from "@/providers/CurrentStateContext";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [rollno, setRollno] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { id } = useParams();


  return <div className="container h-screen flex flex-col">
    <Image
      src="/wz-landscape.png"
      height={200}
      width={200}
      alt=""
      className="w-full max-h-[80px] object-left object-contain border-b-2"
    />
    <div className="max-w-[500px] w-full bg-[var(--comp-1)] py-6 px-8 mx-auto my-auto border-1 shadow-2xl rounded-[8px]">
      <h3 className="text-[32px] text-center">
        <span className="text-[var(--accent-1)]">Metro Polis</span>&nbsp;
        <span>Club</span>
      </h3>
      <p className="text-[14px] text-[var(--dark-1)]/25 text-center font-semibold mt-2">Onboarding Form</p>
      <CurrentStateProvider
        state={onboardingFormInitialState}
        reducer={onboardingFormReducer}
      >
        <Suspense>
          <OnboardingFormContainer />
        </Suspense>
      </CurrentStateProvider>
    </div>
  </div>
}

function OnboardingFormContainer() {
  const [loading, setLoading] = useState(false);
  const { dispatch, ...state } = useCurrentStateContext();
  const fileRef = useRef();
  const searchParams = useSearchParams();

  async function onboardClient() {
    const toastId = toast.loading("Please wait...");
    try {
      setLoading(true);
      const data = new FormData();
      for (const field in state) {
        if (!state[field] && !["email", "mobileNumber", "file"].includes(field)) throw new Error(`${field} is required`);
        data.append(field, state[field]);
      }
      if (!data.get("mobileNumber") && !data.get("email")) throw new Error("One of email or phone number is required");
      const response = await sendDataWithFormData(`clientRegister?mode=form&id=${searchParams.get("id")}`, data)
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      dispatch(clientCreated());
    } catch (error) {
      toast.error(error.message || "Please try again later!");
    } finally {
      setLoading(false);
      toast.dismiss(toastId);
    }
  }

  return <div className="my-8">
    <input
      type="file"
      ref={fileRef}
      hidden
      onChange={e => dispatch(changeFieldvalue("file", e.target.files[0]))}
    />
    <div className="flex flex-col gap-4">
      <Image
        src={state.file ? getObjectUrl(state.file) : "/not-found.png"}
        alt=""
        height={240}
        width={240}
        className="w-24 h-24 border-1 object-contain block mx-auto rounded-full"
        onClick={() => fileRef.current?.click()}
      />
      <FormControl
        label="Name"
        value={state.name}
        onChange={e => dispatch(changeFieldvalue("name", e.target.value))}
        placeholder="Please enter your name"
      />
      <FormControl
        label="Phone Number"
        value={state.phone}
        type="number"
        onChange={e => dispatch(changeFieldvalue("mobileNumber", e.target.value))}
        placeholder="Please enter your phone number"
      />
      <FormControl
        label="Email ID"
        value={state.email}
        type="email"
        onChange={e => dispatch(changeFieldvalue("email", e.target.value))}
        placeholder="Please enter your email"
      />
      <FormControl
        label="City"
        value={state.city}
        onChange={e => dispatch(changeFieldvalue("city", e.target.value))}
        placeholder="Please enter your city"
      />
      <div className="grid grid-cols-2 gap-4">
        <FormControl
          label="Joining Date"
          value={state.joiningDate}
          type="date"
          onChange={e => dispatch(changeFieldvalue("joiningDate", e.target.value))}
          placeholder="Please enter your joining date"
        />
        <FormControl
          label="Sponsored By"
          value={state.sponseredByName}
          onChange={e => dispatch(changeFieldvalue("sponseredByName", e.target.value))}
          placeholder="Please enter your sponsor name"
        />
      </div>
      <Button disabled={loading} onClick={onboardClient} variant="wz">Submit</Button>
    </div>
  </div>
}