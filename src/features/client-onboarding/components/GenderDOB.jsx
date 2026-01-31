import useCurrentStateContext from "@/providers/CurrentStateContext";
import { useState } from "react";
import NextButton from "./NextButton";
import { updateDetails } from "../state/client-onboarding-reducer";
import { GENDERS } from "../state/config";

export default function GenderDobForm() {
  const { gender: defaultGender, dob: defaultDob, dispatch } = useCurrentStateContext()
  const [gender, setGender] = useState(defaultGender || "male")
  const [dob, setDob] = useState(defaultDob || "1999-12-31")
  const handleNext = function () {
    dispatch(updateDetails({
      gender,
      dob,
      stage: "exercise-activity"
    }))
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-lime-400 flex justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold">What is your sex?</h2>
        <p className="mt-1 text-sm opacity-90">
          Please provide accurate details to help offer you more personalized recommendations.
        </p>
        <div className="mt-6 space-y-3">
          {GENDERS.map((item) => (
            <button
              key={item.value}
              onClick={() => setGender(item.value)}
              className={`w-full flex items-center justify-between rounded-full px-5 py-4 bg-white text-black transition ${gender === item.value
                ? 'ring-2 ring-green-600'
                : 'opacity-95'
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
              <div
                className={`h-5 w-5 rounded border flex items-center justify-center ${gender === item.value
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-gray-400'
                  }`}
              >
                {gender === item.value && (
                  <span className="text-white text-xs">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>
        <h2 className="mt-10 text-lg font-semibold uppercase">
          When were you born?
        </h2>
        <p className="mt-1 text-sm opacity-90">
          Select the day, month, and year that you were born.
        </p>
        <div className="mt-4 bg-white rounded-2xl p-4 text-black">
          <label className="block text-sm font-medium mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <NextButton handler={handleNext} />
      </div>
    </div>
  )
}
