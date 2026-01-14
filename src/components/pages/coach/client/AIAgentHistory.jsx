"use client"

import CalenderModal from "@/components/common/CalenderModal"
import ContentError from "@/components/common/ContentError"
import ContentLoader from "@/components/common/ContentLoader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TabsContent } from "@/components/ui/tabs"
import { retrieveAIAgentHistory } from "@/lib/fetchers/app"
import { format } from "date-fns"
import { Activity, Brain, Lightbulb, Utensils, X } from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useState } from "react"
import useSWR from "swr"

const typeIcons = {
  Food: Utensils,
  Mood: Brain,
  Exercise: Activity,
  Guidance: Lightbulb,
}

const typeColors = {
  Food: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Mood: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Exercise: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Guidance: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
}

// Helper function to format numbers and remove floating point precision errors
const formatNumber = (value, decimals = 0) => {
  if (value == null || value === undefined || isNaN(value)) return '0'

  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  // Round to remove floating point errors
  const multiplier = Math.pow(10, decimals)
  const rounded = Math.round(numValue * multiplier) / multiplier

  // Format based on decimal places needed
  if (decimals === 0) {
    return Math.round(rounded).toString()
  }

  // Format with decimals and remove trailing zeros
  return rounded.toFixed(decimals).replace(/\.?0+$/, '')
}

export default function AIAgentHistory() {
  const { id } = useParams()

  const [selectedType, setSelectedType] = useState("all")
  const [selectedDate, setSelectedDate] = useState(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const { data, isLoading, error } = useSWR(
    `client/ai-history/${id}/${format(selectedDate, "dd-MM-yyyy")}`,
    () => retrieveAIAgentHistory(id, format(selectedDate, "dd-MM-yyyy"))
  )

  if (isLoading) return <ContentLoader />

  if (error || !data || [400, 500].includes(data.status_code)) return <ContentError title={error || data?.message} />

  const availableTypes = ['Food', 'Mood', 'Exercise', 'Guidance']

  let filteredHistory = data.history || []
  if (selectedType !== "all") {
    filteredHistory = filteredHistory.filter((item) => item.type === selectedType)
  }

  const handleReset = () => {
    setSelectedType("all")
    setSelectedDate(null)
    setIsCalendarOpen(false)
  }

  return (
    <TabsContent value="ai-agent">
      <div className="space-y-6">
        <Card className="p-0 gap-0">
          <CardHeader className="pt-4">
            <CardTitle className="text-lg">Nutrition Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{formatNumber(data.calories, 0)}</div>
                <div className="text-sm text-muted-foreground">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{formatNumber(data.protein, 2)}g</div>
                <div className="text-sm text-muted-foreground">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{formatNumber(data.carbohydrates, 2)}g</div>
                <div className="text-sm text-muted-foreground">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{formatNumber(data.fats, 2)}g</div>
                <div className="text-sm text-muted-foreground">Fats</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-0 gap-0">
          <CardHeader className="pt-4">
            <CardTitle className="text-lg">Filter History</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-end">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {availableTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CalenderModal
                date={selectedDate}
                setDate={setSelectedDate}
                setOpen={setIsCalendarOpen}
                open={isCalendarOpen}
                className="ml-auto"
              />
              <div className="flex-shrink-0 self-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-0 gap-0">
          <CardHeader className="pt-4">
            <CardTitle className="text-lg flex items-center justify-between">
              Activity History
              <Badge variant="secondary" className="ml-2">
                {filteredHistory.length} entries
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No entries found for the selected filters.</div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item) => {
                  const Icon = typeIcons[item.type]
                  return (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-full ${typeColors[item.type]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.date}
                          </span>
                        </div>
                        <p className="font-medium truncate">
                          {item.question.startsWith("http")
                            ? <Image
                              src={item.question}
                              alt=""
                              className="w-full aspect-video object-contain bg-white border-1 rounded-[10px]"
                              onError={e => e.target.src = "/not-found.png"}
                              height={400}
                              width={400}
                            />
                            : item.question || "No description available"}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  )
}
