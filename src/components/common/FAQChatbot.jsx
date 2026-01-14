"use client"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  MessageCircle,
  X,
  ArrowLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Minimize2,
  ExternalLink,
  Heart,
  HelpCircle,
  Search,
  User,
  Bot,
} from "lucide-react"
import { getChatBotData } from "@/lib/fetchers/app"
import useSWR from "swr"
import Link from "next/link"
import AIChat from "./AIChat"

export default function FAQChatbot() {
  const { isLoading, error, data } = useSWR("chatbot-data", getChatBotData)

  if (!data) return <></>

  const categories = Object.groupBy(data?.data || [], (item) => item.category)
  const faqData = []
  for (const field in categories) {
    faqData.push({
      category: field,
      questions: categories[field],
    })
  }
  return <FAQChatbotContainer faqData={faqData} />
}

function FAQChatbotContainer({ faqData }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentView, setCurrentView] = useState("categories")
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [feedbackGiven, setFeedbackGiven] = useState({})
  const [positiveGiven, setPositiveGiven] = useState({})
  const [showEscalation, setShowEscalation] = useState(false)
  const [negativeFeedbackCount, setNegativeFeedbackCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [aiOpened, setAiOpened] = useState(false)

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const results = []
    const query = searchQuery.toLowerCase()

    faqData.forEach((category) => {
      category.questions.forEach((question) => {
        if (
          question.question.toLowerCase().includes(query) ||
          question.answer.toLowerCase().includes(query) ||
          category.category.toLowerCase().includes(query)
        ) {
          results.push({
            ...question,
            categoryName: category.category,
            categoryIcon: category.icon,
          })
        }
      })
    })

    return results
  }, [searchQuery, faqData])

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setCurrentView("questions")
    setSearchQuery("")
    setShowSearch(false)
  }

  const handleSearchToggle = () => {
    setShowSearch(!showSearch)
    setSearchQuery("")
    if (showSearch) {
      setCurrentView("categories")
    }
  }

  const handleSearchQuestionSelect = (question) => {
    setSelectedQuestion(question)
    setCurrentView("answer")
    setShowSearch(false)
    setShowEscalation(false)
  }

  const handleContactAgent = () => {
    const message = encodeURIComponent(`Hi! I have a question that's not in your FAQ: "${searchQuery}"`)
    const whatsappURL = `https://wa.me/+917696259940?text=${message}`
    window.open(whatsappURL, "_blank")
  }

  const handleQuestionSelect = (question) => {
    setSelectedQuestion(question)
    setCurrentView("answer")
    setShowEscalation(false)
  }

  const handleBack = () => {
    if (currentView === "answer") {
      setCurrentView("questions")
      setSelectedQuestion(null)
    } else if (currentView === "questions") {
      setCurrentView("categories")
      setSelectedCategory(null)
    }
  }

  const handleFeedback = (isPositive) => {
    if (!selectedQuestion) return

    setFeedbackGiven((prev) => ({ ...prev, [selectedQuestion.id]: true }))
    setPositiveGiven((prev) => ({ ...prev, [selectedQuestion.id]: isPositive }))

    if (!isPositive) {
      const newCount = negativeFeedbackCount + 1
      setNegativeFeedbackCount(newCount)
      if (newCount >= 2) {
        setShowEscalation(true)
      }
    }
  }

  const handleWhatsAppHandoff = () => {
    const message = encodeURIComponent(`Hi! I need help with: ${selectedQuestion?.question || "General support"}`)
    const whatsappURL = `https://wa.me/1234567890?text=${message}`
    window.open(whatsappURL, "_blank")
  }

  const toggleAIChat = () => {
    setAiOpened(!aiOpened)
  }

  useEffect(function () {
    if (isOpen) document.body.style.overflow = "hidden";
    return function () {
      document.body.style.overflow = "auto";
    }
  }, [isOpen])

  const renderSearch = () => (
    <div className="h-full">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={handleSearchToggle} className="p-1 hover:bg-gray-200">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold text-gray-900">Search FAQ</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Type your question here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 w-full border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
            autoFocus
          />
        </div>
      </div>

      <ScrollArea className="flex-1" style={{ height: "calc(100% - 140px)" }}>
        {searchQuery.trim() ? (
          <div className="p-4">
            {searchResults.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 mb-3">
                  Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                </p>
                {searchResults.map((question, index) => (
                  <button
                    key={index}
                    className="w-full p-4 text-left bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-sm hover:border-green-200 group"
                    onClick={() => handleSearchQuestionSelect(question)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm">{question.categoryIcon}</span>
                          <span className="text-xs text-gray-500">{question.categoryName}</span>
                        </div>
                        <span className="text-gray-900 group-hover:text-green-600 transition-colors text-sm">
                          {question.question}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors ml-2 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h4 className="text-gray-900 font-medium mb-2">No results found</h4>
                <p className="text-sm text-gray-500 mb-6">We couldn't find any answers matching "{searchQuery}"</p>
                <div className="space-y-3">
                  <Button
                    onClick={toggleAIChat}
                    className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2 rounded-lg w-full"
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Ask AI Assistant
                  </Button>
                  <Button
                    onClick={handleContactAgent}
                    className="bg-white border border-green-200 hover:bg-gray-50 text-green-600 font-medium px-6 py-2 rounded-lg w-full"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Ask our team
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Search className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="text-gray-900 font-medium mb-2">Search our FAQ</h4>
            <p className="text-sm text-gray-500">Type keywords to find answers instantly</p>
          </div>
        )}
      </ScrollArea>
    </div>
  )

  const renderCategories = () => (
    <div className="">
      <div className="px-6 py-3 border-b border-gray-100">
        <div className="flex itms-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-">How can we help you?</h3>
            <p className="text-sm text-gray-500">Choose a category to get started</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleSearchToggle} className="p-2 hover:bg-gray-100 rounded-lg">
              <Search className="h-4 w-4 text-gray-600" />
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleAIChat} className="p-2 hover:bg-gray-100 rounded-lg">
              <Bot className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="h-full">
        <div className="p-4 space-y-3">
          {faqData.map((category, index) => (
            <button
              key={index}
              className="w-full p-4 text-left bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-sm hover:border-green-200 group"
              onClick={() => handleCategorySelect(category)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <span className="text-gray-900 font-medium group-hover:text-green-600 transition-colors">
                      {category.category}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors" />
              </div>
            </button>
          ))}
        </div>

        {/* AI Chat Option */}
        <div className="p-4">
          <button
            className="w-full p-4 text-left bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 rounded-xl transition-all duration-200 hover:shadow-sm group"
            onClick={toggleAIChat}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl bg-green-100 p-1 rounded-full flex items-center justify-center w-10 h-10">
                  <Bot className="h-6 w-6 text-green-600" />
                </span>
                <div>
                  <span className="text-gray-900 font-medium group-hover:text-green-600 transition-colors">
                    Ask AI Assistant
                  </span>
                  <p className="text-xs text-gray-500">Get instant answers to your questions</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors" />
            </div>
          </button>
        </div>

        {/* Quick access to human support */}
        <div className="mt-auto p-4 border-t border-gray-100 bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Can't find what you're looking for?</p>
            <Button
              onClick={handleContactAgent}
              variant="outline"
              className="bg-white hover:bg-gray-50 border-green-200 text-green-600 hover:text-green-700 px-4 py-2 rounded-lg"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Talk to our team
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )

  const renderQuestions = () => (
    <div className="h-full">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack} className="p-1 hover:bg-gray-200">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-xl">{selectedCategory?.icon}</span>
              <span className="font-medium text-gray-900">{selectedCategory?.category}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleSearchToggle} className="p-2 hover:bg-gray-100 rounded-lg">
              <Search className="h-4 w-4 text-gray-600" />
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleAIChat} className="p-2 hover:bg-gray-100 rounded-lg">
              <Bot className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {selectedCategory?.questions.map((question, index) => (
            <button
              key={index}
              className="w-full p-4 text-left bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-sm hover:border-green-200 group"
              onClick={() => handleQuestionSelect(question)}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900 group-hover:text-green-600 transition-colors">{question.question}</span>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  const renderAnswer = () => (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={handleBack} className="p-1 hover:bg-gray-200">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium text-gray-900 text-sm line-clamp-1">{selectedQuestion?.question}</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
            <p className="text-gray-800 leading-relaxed">{selectedQuestion?.answer}</p>
          </div>

          {selectedQuestion?.cta && (
            <Link
              href={selectedQuestion.link}
              target="_blank"
              className="w-fit px-8 mx-auto bg-green-500 hover:bg-green-600 text-white font-medium py-3 flex items-center rounded-xl transition-all duration-200 hover:shadow-lg"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {selectedQuestion.cta}
            </Link>
          )}

          {selectedQuestion?.hasScreenshot && (
            <div className="text-center bg-blue-50 border border-blue-200 p-4 rounded-xl">
              <div className="text-blue-600 mb-2">📸</div>
              <p className="text-sm text-blue-700 font-medium">Visual guide available</p>
            </div>
          )}

          {selectedQuestion?.hasTable && (
            <div className="text-center bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
              <div className="text-emerald-600 mb-2">📊</div>
              <p className="text-sm text-emerald-700 font-medium">Complete pricing breakdown available</p>
            </div>
          )}

          {selectedQuestion?.hasCarousel && (
            <div className="text-center bg-purple-50 border border-purple-200 p-4 rounded-xl">
              <div className="text-purple-600 mb-2">🎠</div>
              <p className="text-sm text-purple-700 font-medium">Browse all upcoming events</p>
            </div>
          )}

          {/* Feedback Section */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-3">Was this helpful?</p>
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFeedback(true)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${feedbackGiven[selectedQuestion?.id] && positiveGiven[selectedQuestion?.id]
                    ? "bg-green-500 text-white border-green-500 hover:bg-green-600"
                    : "hover:border-green-500 hover:bg-green-50 hover:text-green-600"
                    }`}
                  disabled={feedbackGiven[selectedQuestion?.id]}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Yes</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFeedback(false)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${feedbackGiven[selectedQuestion?.id] && !positiveGiven[selectedQuestion?.id]
                    ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
                    : "hover:border-red-500 hover:bg-red-50 hover:text-red-600"
                    }`}
                  disabled={feedbackGiven[selectedQuestion?.id]}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>No</span>
                </Button>
              </div>
            </div>

            {feedbackGiven[selectedQuestion?.id] && (
              <div className="text-center mt-4">
                {positiveGiven[selectedQuestion?.id] ? (
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <Heart className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">Thanks for your feedback!</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Sorry this didn't help.</p>
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={toggleAIChat}
                        className="bg-green-500 text-white border-green-500 hover:bg-green-600 px-4 py-2 rounded-lg"
                      >
                        <Bot className="h-4 w-4 mr-2" />
                        Ask AI Assistant
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleWhatsAppHandoff}
                        className="bg-white text-green-600 border-green-200 hover:bg-gray-50 px-4 py-2 rounded-lg"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chat with support
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Escalation for multiple negative feedback */}
          {showEscalation && (
            <div className="bg-red-50 border border-red-200 p-5 rounded-xl text-center">
              <div className="text-red-600 mb-3">
                <HelpCircle className="h-8 w-8 mx-auto mb-2" />
                <h4 className="font-semibold">Need more help?</h4>
                <p className="text-sm mt-1">Let's connect you with a human</p>
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={toggleAIChat}
                  className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2 rounded-lg"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Ask AI Assistant
                </Button>
                <Button
                  onClick={handleWhatsAppHandoff}
                  className="bg-white border border-green-200 hover:bg-gray-50 text-green-600 font-medium px-6 py-2 rounded-lg"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Talk to support
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className={`w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${isOpen ? "hidden" : "flex"
            } items-center justify-center`}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bottom-10 z-50 flex items-end justify-end p-6 py-0">
          <div className="fixed inset-0 bg-black/10 bg-opacity-20" onClick={() => setIsOpen(false)} />

          {/* Chatbot Widget */}
          <Card className="relative w-full max-w-md h-[80vh] py-0 gap-0 bg-white shadow-2xl rounded-2xl overflow-hidden slide-in">
            {aiOpened ? (
              <AIChat onClose={() => setAiOpened(false)} />
            ) : (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">Hi there! 👋</h2>
                      <p className="text-green-100 text-sm mt-1">How can we help you?</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg"
                      >
                        <Minimize2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-0 overflow-y-auto">
                  {showSearch ? (
                    renderSearch()
                  ) : (
                    <>
                      {currentView === "categories" && renderCategories()}
                      {currentView === "questions" && renderQuestions()}
                      {currentView === "answer" && renderAnswer()}
                    </>
                  )}
                </CardContent>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  )
}


function GPT({ onClose }) {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setChat(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const res = await streamResponse("chatbot/chat", { message: input });
    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let assistantMessage = { role: 'assistant', content: '' };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      assistantMessage.content += chunk;
      setChat(prev => [...prev.slice(0, -1), assistantMessage]);
    }

    setIsLoading(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="bg-gray-100 p-4 rounded shadow h-96 overflow-y-auto">
        {chat.map((msg, i) => (
          <p key={i} className={msg.role === 'user' ? 'text-blue-600' : 'text-green-600'}>
            <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
          </p>
        ))}
        {isLoading && <p className="text-green-600"><strong>Bot:</strong> typing...</p>}
      </div>
      <div className="mt-4 flex">
        <input
          type="text"
          className="border p-2 flex-1 rounded-l"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 rounded-r">
          Send
        </button>
      </div>
    </div>
  );
}