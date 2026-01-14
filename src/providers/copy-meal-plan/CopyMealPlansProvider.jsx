import reducer from "./reducer";
import { createContext, useContext, useMemo, useReducer, useRef } from "react";

const CopyMealPlansProvider = createContext()

export function CopyMealPlansContext({ children, initialState }) {
  const initialSnapshotRef = useRef(initialState)
  const [state, dispatch] = useReducer(reducer, initialState)

  const value = useMemo(() => ({
    ...state,
    dispatch,
    initialSnapshot: initialSnapshotRef.current,
  }), [state, dispatch])

  return <CopyMealPlansProvider.Provider value={value}>
    {children}
  </CopyMealPlansProvider.Provider>
}

export default function useCopyMealPlan() {
  const state = useContext(CopyMealPlansProvider);
  return state
}