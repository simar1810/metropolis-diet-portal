import { sendUserInsight } from "@/lib/api";
import { useAppSelector } from "@/providers/global/hooks";

export default function useUserInsight(payload = {}) {
  const { _id: userId } = useAppSelector(state => state.client.data) || {}

  async function createInsight(data = {}) {
    if (!userId) {
      return;
    }

    await sendUserInsight(userId, {
      ...payload,
      ...data
    })
  }

  return { createInsight }
}
