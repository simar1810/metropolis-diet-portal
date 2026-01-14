"use client"
import {
  useContext,
  useReducer,
  createContext
} from "react";

const CurrentStateContext = createContext();

export function CurrentStateProvider({
  children,
  reducer,
  state
}) {
  const [currentState, dispatch] = useReducer(reducer, state);
  return <CurrentStateContext.Provider value={{ ...currentState, dispatch }}>
    {children}
  </CurrentStateContext.Provider>
}

export default function useCurrentStateContext() {
  const context = useContext(CurrentStateContext);
  return context;
}