import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield } from "lucide-react";
import { sendData } from "@/lib/api";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { toast } from "sonner";
import UserLoginForm from "./UserLoginForm";

export default function InputMobileNumber() {
  const { mobileNumber, loginType, dispatch } = useCurrentStateContext();
  const [touched, setTouched] = useState(false);

  // Allow only digits, max 10
  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    dispatch({ type: "UPDATE_MOBILE_NUMBER", payload: digits });
  };

  const handleLoginTypeChange = (value) => {
    dispatch({ type: "UPDATE_LOGIN_TYPE", payload: value });
  };

  const sendOtp = async () => {
    setTouched(true);
    if (mobileNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    try {
      const data = { credential: "+91" + mobileNumber, fcmToken: "" };
      const res = await sendData(
        "app/signin?authMode=mob&clientType=web",
        data
      );
      if (res.status_code === 400) throw new Error(res.message);
      dispatch({
        type: "UPDATE_CURRENT_STATE",
        payload: {
          stage: 2,
          user: res.data.user,
          isFirstTime: res.data.isFirstTime,
        },
      });
    } catch (err) {
      toast.error(err.message || "Please try again later!");
    }
  };

  const isValid = mobileNumber.length === 10;

  return (
    <div className="max-w-md mx-auto p-4">
      <h3 className="text-2xl font-semibold mb-4">Hi, Welcome</h3>
      <h5 className="text-lg mb-1">Ready to Inspire Wellness?</h5>
      <p className="text-gray-600 text-sm mb-6">
        Sign up or log in now to transform.
      </p>

      <Tabs value={loginType} onValueChange={handleLoginTypeChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="coach" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Coach
          </TabsTrigger>
          <TabsTrigger value="user" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            User
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coach" className="space-y-4">
          <div className="mb-6">
            <label
              htmlFor="mobile"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                +91
              </span>
              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                pattern="\d*"
                maxLength={10}
                placeholder="Enter Mobile number"
                value={mobileNumber}
                onChange={handleChange}
                onBlur={() => setTouched(true)}
                className={`w-full pl-12 pr-3 py-2 border rounded focus:outline-none ${
                  touched && !isValid
                    ? "border-red-500"
                    : "border-gray-300 focus:border-indigo-500"
                }`}
              />
            </div>
            {touched && !isValid && (
              <p className="text-xs text-red-500 mt-1">
                Mobile number must be exactly 10 digits.
              </p>
            )}
          </div>

          <Button
            variant="wz"
            size="lg"
            className="w-full"
            onClick={sendOtp}
            disabled={!isValid}
          >
            Send OTP
          </Button>
        </TabsContent>

        <TabsContent value="user">
          <UserLoginForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
