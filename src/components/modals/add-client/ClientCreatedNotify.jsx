import { copyText } from "@/lib/utils";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { useAppSelector } from "@/providers/global/hooks";
import { Check } from "lucide-react";
import { toast } from "sonner";

export default function ClientCreatedNotify() {
  const { clientId } = useCurrentStateContext();
  const { coachRefUrl = "https://wellnessz.in/app" } = useAppSelector(state => state.coach.data);

  return <>
    <div className="p-2 pt-0">
      <Check className="text-[var(--accent-1)] w-[176px] h-[173px] mx-auto" />
      <h2 className="!font-semibold text-[var(--accent-1)] text-lg text-center">
        Client Added Successfully
      </h2>
      <p className="text-[14px] text-center mt-10 text-gray-400 font-semibold">
        Your Client Account has been created
        <br /> with Client ID #${clientId}
      </p>
    </div>
    <div className="flex flex-col gap-0 mb-[100px]">
      <div className="flex items-center border border-gray-300 rounded-lg mx-auto ">
        <div className="px-4 py-2">
          {`${coachRefUrl}/loginClient?clientID=${clientId}`}
        </div>
        <button
          onClick={() => {
            copyText(`${coachRefUrl}/loginClient?clientID=${clientId}`)
            toast.success("Client ID copied")
          }}
          className="bg-[var(--accent-1)] rounded-r-md text-white px-4 py-[16px] text-sm font-medium hover:bg-[var(--accent-1)] transition"
        >
          Copy
        </button>
      </div>
    </div>
  </>
}