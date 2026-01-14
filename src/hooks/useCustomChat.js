import { sendData } from "@/lib/api"
import { useState } from "react"
import { toast } from "sonner"

export function useCustomChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => setInput(e.target.value)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      parts: [{ type: "text", text: input }]
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await sendData("chatbot/chat", { message: input }, "POST")
      if (response.status_code !== 200) throw new Error(response.message || "Something went wrong.");
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        parts: [{ type: "text", text: response.data }]
      }])
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return { messages, input, handleInputChange, handleSubmit, isLoading }
}