"use client";
import LoginContainer from "@/components/pages/auth/LoginContainer";
import state from "@/config/state-data/login";
import reducer from "@/config/state-reducers/login";
import { CurrentStateProvider } from "@/providers/CurrentStateContext";
import Script from "next/script";

export default function Page() {
  return <>
    <Script id="conversion-tracker" strategy="afterInteractive">
      {`
          gtag('event', 'conversion', {
            'send_to': 'AW-17365870141/c5BTCIXg6_saEL3M2NhA'
          });
        `}
    </Script>
    <CurrentStateProvider
      reducer={reducer}
      state={state}
    >
      <LoginContainer />
    </CurrentStateProvider>
  </>
}