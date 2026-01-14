import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isLoggedIn: false,
  data: null
}

const counterSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    storeClient: function (state, action) {
      state.isLoggedIn = true;
      state.data = {
        ...action.payload
      }
    },
    destroyClient: function (state) {
      state.isLoggedIn = false;
      state.data = null;
    },
    updateClientField: function (state, action) {
      for (const field in action.payload) {
        state.data[field] = action.payload[field]
      }
    },
  },
})

export default counterSlice.reducer;
export const {
  storeClient,
  destroyClient,
  updateClientField
} = counterSlice.actions;