'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { STATES } from '../state/config'
import useCurrentStateContext from '@/providers/CurrentStateContext'
import { updateDetails } from '../state/client-onboarding-reducer'
import NextButton from './NextButton'

export default function CountryRegionSelector({ }) {
  const { dispatch, countryPreference, regionPreference } = useCurrentStateContext()
  const [country] = useState(countryPreference || "India 🇮🇳")
  const [region, setRegion] = useState(regionPreference || "")

  const handleNext = function () {
    dispatch(updateDetails({
      stage: "preferences",
      countryPreference: country,
      regionPreference: region,
    }))
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h3 className="text-sm font-semibold tracking-wide uppercase mb-3">
          Country Preferences
        </h3>
        <div className="flex items-center justify-between rounded-2xl bg-green-100 px-5 py-4">
          <span className="text-base font-medium text-black">
            {country} 🇮🇳
          </span>
          <ChevronDown className="h-5 w-5 text-gray-700" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold tracking-wide uppercase mb-3">
          Major Regional Practice for Diet
        </h3>
        <div className="relative">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full appearance-none rounded-2xl bg-blue-100 px-5 py-4 text-base font-medium text-black focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="" disabled>
              Select a state
            </option>
            {STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-700" />
        </div>
      </div>
      <NextButton handler={handleNext} />
    </div>
  )
}
