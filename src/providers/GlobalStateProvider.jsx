"use client"
import { useEffect, useRef } from "react"
import { Provider } from "react-redux"
import { makeStore } from "./global/store"
import { analytics } from "@/lib/firebase"

export default function GlobalStateProvider({ children }) {
  const storeRef = useRef(undefined)
  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      analytics;
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>
}