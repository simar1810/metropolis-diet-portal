import { configureStore } from '@reduxjs/toolkit';
import coach from "./slices/coach"
import client from "./slices/client"

export const makeStore = function () {
  return configureStore({
    reducer: {
      coach,
      client
    },
  })
}