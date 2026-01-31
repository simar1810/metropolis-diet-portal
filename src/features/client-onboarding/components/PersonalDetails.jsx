import { Input } from "@/components/ui/input";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { useState } from "react";
import NextButton from "./NextButton";
import { updateDetails } from "../state/client-onboarding-reducer";

const validateDetails = (details) => {
  const errors = {}

  if (!details.firstName.trim()) {
    errors.firstName = "First name is required"
  }

  if (!details.lastName.trim()) {
    errors.lastName = "Last name is required"
  }

  const indianMobileRegex = /^[6-9]\d{9}$/

  if (!details.mobileNumber) {
    errors.mobileNumber = "Mobile number is required"
  } else if (!indianMobileRegex.test(details.mobileNumber)) {
    errors.mobileNumber = "Enter a valid 10-digit Indian mobile number"
  }

  return errors
}

export default function PersonalDetails() {
  const { dispatch } = useCurrentStateContext()
  const [errors, setErrors] = useState({})
  const [details, setDetails] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: ""
  })

  const handleNext = function () {
    const errors = validateDetails(details)
    if (Object.keys(errors).length > 0) {
      setErrors(errors)
      return
    } else {
      setErrors({})
    }
    dispatch(updateDetails({
      ...details,
      stage: "goal"
    }))
  }

  return <div>
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          First Name
        </label>
        <Input
          className="bg-gray-100"
          value={details.firstName}
          onChange={(e) =>
            setDetails((prev) => ({
              ...prev,
              firstName: e.target.value,
            }))
          }
        />
        {errors.firstName && (
          <span className="text-xs text-red-500">
            {errors.firstName}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Last Name
        </label>
        <Input
          className="bg-gray-100"
          value={details.lastName}
          onChange={(e) =>
            setDetails((prev) => ({
              ...prev,
              lastName: e.target.value,
            }))
          }
        />
        {errors.lastName && (
          <span className="text-xs text-red-500">
            {errors.lastName}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Mobile Number
        </label>
        <Input
          className="bg-gray-100"
          type="number"
          value={details.mobileNumber}
          onChange={(e) =>
            setDetails((prev) => ({
              ...prev,
              mobileNumber: e.target.value,
            }))
          }
        />
        {errors.mobileNumber && (
          <span className="text-xs text-red-500">
            {errors.mobileNumber}
          </span>
        )}
      </div>
    </div>
    <NextButton
      handler={handleNext}
    />
  </div>
}