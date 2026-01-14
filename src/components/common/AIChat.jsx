"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Bot, User, Loader2 } from "lucide-react"
import { useCustomChat } from "@/hooks/useCustomChat"

export default function AIChat({ onClose }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useCustomChat()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1 hover:bg-white/20 text-white">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-xl font-bold">AI Assistant</h2>
              <p className="text-green-100 text-sm mt-1">Ask me anything</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Bot className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-gray-900 font-medium mb-2">How can I help you today?</h4>
              <p className="text-sm text-gray-500">Ask me any question and I'll do my best to assist you.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${message.role === "user"
                    ? "bg-green-500 text-white rounded-tr-none"
                    : "bg-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    <span className="text-xs font-medium">{message.role === "user" ? "You" : "AI Assistant"}</span>
                  </div>
                  <div className="text-sm">
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return <div key={i}>{part.text}</div>
                      }
                      return null
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 py-3 px-4 border-gray-200 rounded-full focus:border-green-500 focus:ring-2 focus:ring-green-200"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-full bg-green-500 hover:bg-green-600 text-white px-4"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  )
}