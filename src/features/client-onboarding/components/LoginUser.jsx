import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendData } from "@/lib/api";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { useState } from "react";
import { toast } from "sonner";
import { updateDetails } from "../state/client-onboarding-reducer";

export default function LoginUser() {
  const { mobileNumber, dispatch } = useCurrentStateContext();

  const [details, setDetails] = useState({
    mobileNumber,
    otp: "",
  });

  const [currentStage, setCurrentStage] = useState("input-mobilenumber");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);


  async function sendOtp() {
    try {
      setSendingOtp(true);

      const response = await sendData("app/metropolis/send-otp", {
        mobileNumber: details.mobileNumber,
      });

      if (response.status_code !== 200) {
        throw new Error(response.message);
      }

      toast.success(response.message || "OTP sent successfully");
      setCurrentStage("otp-sent");
    } catch (error) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  }

  async function verifyOtp() {
    try {
      setVerifyingOtp(true);

      const response = await sendData("app/metropolis/verify-otp", {
        mobileNumber: details.mobileNumber,
        otp: details.otp,
      });

      if (response.status_code !== 200) {
        throw new Error(response.message);
      }

      toast.success(response.message || "OTP verified successfully");
      setCurrentStage("verified");

      dispatch(updateDetails({
        mobileNumber: details.mobileNumber,
        coachId: response.data?._id,
        stage: "client-selection",
        clientsList: response?.data?.clients
      }))
    } catch (error) {
      toast.error(error.message || "Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  }

  return (
    <div>
      <div>
        <label className="text-sm font-medium text-gray-700">
          Mobile Number
        </label>
        <div className="flex items-center gap-4">
          <Input
            placeholder="mobile number"
            type="number"
            className="bg-gray-100"
            value={details.mobileNumber}
            disabled={currentStage !== "input-mobilenumber"}
            onChange={(e) =>
              setDetails((prev) => ({
                ...prev,
                mobileNumber: e.target.value,
              }))
            }
          />
          <Button
            onClick={sendOtp}
            disabled={
              currentStage !== "input-mobilenumber" ||
              !details.mobileNumber ||
              sendingOtp
            }
          >
            {sendingOtp ? "Sending..." : "Send OTP"}
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <label className="text-sm font-medium text-gray-700">
          OTP
        </label>
        <div className="flex items-center gap-4">
          <Input
            disabled={currentStage !== "otp-sent"}
            maxLength={4}
            placeholder="XXXX"
            type="number"
            className="bg-gray-100"
            value={details.otp}
            onChange={(e) => {
              if (e.target.value.length <= 4) {
                setDetails((prev) => ({
                  ...prev,
                  otp: e.target.value,
                }));
              }
            }}
          />
          <Button
            onClick={verifyOtp}
            disabled={
              currentStage !== "otp-sent" ||
              details.otp.length !== 4 ||
              verifyingOtp
            }
          >
            {verifyingOtp ? "Verifying..." : "Verify OTP"}
          </Button>
        </div>
      </div>
    </div>
  );
}