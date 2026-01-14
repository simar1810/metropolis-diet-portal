"use client"
import FormControl from "@/components/FormControl";
import { SelectOrganisation } from "@/components/modals/coach/UpdateDetailsModal";
import { Button } from "@/components/ui/button";
import { setFieldValue } from "@/config/state-reducers/login";
import { sendData } from "@/lib/api";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { useAppDispatch } from "@/providers/global/hooks";
import { updateCoachField } from "@/providers/global/slices/coach";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function RegisterContainer() {
  const [loading, setLoading] = useState(false);
  const { dispatch, ...state } = useCurrentStateContext();

  const router = useRouter();
  const dispatchRedux = useAppDispatch();

  async function registerCoach() {
    try {
      setLoading(true);
      const response = await sendData("app/register", state.registration);
      if (response.status_code !== 200) throw new Error(response.message);
      dispatchRedux(updateCoachField(response.data))
      toast.success(response.message);
      router.push("/coach/dashboard");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return <div className="grow">
    <h3 className="text-[32px] mb-4">Welcome, Coach</h3>
    <div className="mt-4 grid grid-cols-2 gap-4">
      <FormControl
        label="Name"
        placeholder="Enter Name"
        className="text-[14px] [&_.label]:font-[500]"
        value={state.name}
        onChange={e => dispatch(setFieldValue("name", e.target.value))}
      />
      <FormControl
        label="No. Of Clients"
        placeholder="Expected Clients"
        className="text-[14px] [&_.label]:font-[500]"
        value={state.expectedNoOfClients}
        onChange={e => dispatch(setFieldValue("expectedNoOfClients", e.target.value))}
      />
      <SelectOrganisation
        value={state.organisation}
        onChange={e => dispatch(setFieldValue("organisation", e.target.value))}
      />
      <FormControl
        label="City"
        placeholder="City"
        className="text-[14px] [&_.label]:font-[500]"
        value={state.city}
        onChange={e => dispatch(setFieldValue("city", e.target.value))}
      />
      <FormControl
        label="Coach Ref (optional)"
        placeholder="Coach Ref"
        className="text-[14px] [&_.label]:font-[500]"
        value={state.coachRef}
        onChange={e => dispatch(setFieldValue("coachRef", e.target.value))}
      />
    </div>
    <div className="text-[13px] mt-8 flex items-center gap-1">
      <FormControl
        id="acceptance"
        className="[&_.input]:mt-0"
        type="checkbox"
        checked={state.terms}
        onChange={e => dispatch(setFieldValue("terms", !state.terms))}
      />
      <label htmlFor="acceptance">
        <span>I agree to all the</span>&nbsp;
        <span className="text-[var(--accent-1)]">Terms</span>&nbsp;
        <span>and</span>&nbsp;
        <span className="text-[var(--accent-1)]">Privacy Policies</span>
      </label>
    </div>
    <Button
      variant="wz"
      className="block px-12 mx-auto mt-10"
      onClick={registerCoach}
      disabled={loading}
    >
      Register
    </Button>
    <div className="text-[14px] mt-4 flex items-center justify-center gap-1">
      <p className="text-[var(--dark-1)]/50">Already have an account?</p>
      <Link href="/login" className="text-[var(--accent-1)] font-bold">Login</Link>
    </div>
  </div>
}