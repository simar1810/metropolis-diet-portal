"use client"

import RegisterUserContainer from "@/features/client-onboarding/components"
import { clientOnboardingReducer } from "@/features/client-onboarding/state/client-onboarding-reducer"
import { buildClientOnboardingIS } from "@/features/client-onboarding/state/initialState"
import { CurrentStateProvider } from "@/providers/CurrentStateContext"

export default function Page() {
  return <div className="content-container content-height-screen mt-0">
    <CurrentStateProvider
      state={buildClientOnboardingIS()}
      reducer={clientOnboardingReducer}
    >
      <h4>Register Client</h4>
      <RegisterUserContainer />
    </CurrentStateProvider>
  </div>
}