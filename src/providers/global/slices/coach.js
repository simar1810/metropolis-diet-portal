import { permissions } from '@/config/data/permissions';
import { subscriptionDaysRemaining } from '@/lib/utils';
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isLoggedIn: false,
  coach: null
}

const counterSlice = createSlice({
  name: 'coach',
  initialState,
  reducers: {
    store: function (state, action) {
      const subscriptionInfo = subscriptionDaysRemaining(action.payload?.subscription?.planCode, action.payload?.subscription?.endDate)
      state.isLoggedIn = true;
      state.data = {
        ...action.payload,
        roles: action.payload?.subscription?.planCode
          ? permissions[action.payload?.subscription?.planCode]
          : [],
        subscription: {
          ...action.payload?.subscription,
          planType: subscriptionInfo?.planType,
          pendingDays: subscriptionInfo?.pendingDays,
          alertShown: subscriptionInfo?.pendingDays < 15 && action.payload?.subscription.planCode === 0
            ? true
            : subscriptionInfo?.pendingDays < 5 ? true : false
        },
      }
    },
    destroy: function (state) {
      state.isLoggedIn = false;
      state.data = null;
    },
    updateCoachField: function (state, action) {
      for (const field in action.payload) {
        state.data[field] = action.payload[field]
      }
    },
  },
})

export default counterSlice.reducer;
export const {
  store,
  destroy,
  updateCoachField
} = counterSlice.actions;