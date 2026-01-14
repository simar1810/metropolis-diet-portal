import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CalendarDays, Clock, FileText, ImageIcon, Star } from "lucide-react"

export default function DisplayClientQuestionaire({ data }) {
  const renderAnswer = (question) => {
    const { type } = question

    switch (type) {
      case "shortAnswer":
        return (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Answer:</p>
            <p className="font-medium">{question.answer || "No answer provided"}</p>
          </div>
        )

      case "paragraph":
        return (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Answer:</p>
            <p className="font-medium whitespace-pre-wrap">{question.answer || "No answer provided"}</p>
          </div>
        )

      case "multipleChoice":
        return (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Selected:</p>
            <Badge variant="secondary" className="mt-1">
              {question.answer || "No selection"}
            </Badge>
          </div>
        )

      case "checkBoxes":
        const selectedOptions = question.answer ? question.answer.split(",") : []
        return (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Selected options:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((option, index) => (
                  <Badge key={index} variant="secondary">
                    {option.trim()}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No options selected</span>
              )}
            </div>
          </div>
        )

      case "dropdown":
        return (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Selected:</p>
            <Badge variant="secondary" className="mt-1">
              {question.answer || "No selection"}
            </Badge>
          </div>
        )

      case "linearScale":
        return (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Rating:</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">
                {question.answer || "Not rated"} / {question.maxScale}
              </Badge>
              {question.label1 && question.label2 && (
                <span className="text-xs text-muted-foreground">
                  ({question.label1} - {question.label2})
                </span>
              )}
            </div>
          </div>
        )

      case "rating":
        const rating = Number.parseInt(question.answer) || 0
        return (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Rating:</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[...Array(question.maxScale)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <Badge variant="outline">
                {rating} / {question.maxScale}
              </Badge>
            </div>
          </div>
        )

      case "date":
        return (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Date:</p>
            <div className="flex items-center gap-2 mt-1">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{question.dateTime || "No date selected"}</span>
            </div>
          </div>
        )

      case "time":
        return (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Time:</p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{question.dateTime || "No time selected"}</span>
            </div>
          </div>
        )

      case "attachFile":
        return (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Attachment:</p>
            <div className="mt-1">
              {question.filePath && (
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{question.filePath}</span>
                </div>
              )}
              {question.imagePath && (
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{question.imagePath}</span>
                </div>
              )}
              {!question.filePath && !question.imagePath && (
                <span className="text-sm text-muted-foreground">No file attached</span>
              )}
            </div>
          </div>
        )

      default:
        return (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Answer:</p>
            <p className="font-medium">Unknown question type</p>
          </div>
        )
    }
  }
  const getAnswerStatus = (question) => {
    const { type } = question
    let hasAnswer = false

    switch (type) {
      case "shortAnswer":
      case "paragraph":
        hasAnswer = question.answer && question.answer.trim() !== ""
        break
      case "multipleChoice":
      case "checkBoxes":
      case "dropdown":
      case "linearScale":
      case "rating":
        hasAnswer = question.answer && question.answer.toString().trim() !== ""
        break
      case "date":
      case "time":
        hasAnswer = question.dateTime && question.dateTime.trim() !== ""
        break
      case "attachFile":
        hasAnswer = question.filePath || question.imagePath
        break
      default:
        hasAnswer = false
    }

    return hasAnswer
  }
  return (
    <div className="w-full max-w-[90vw] md:max-w-4xl mx-auto p-1 md:p-6">
      {/* <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">Saved Answers</h1>
        <p className="text-muted-foreground text-center">Review your previously submitted responses</p>
      </div> */}
      <Accordion type="multiple" className="space-y-4 pb-2">
        {data.map((section, sectionIndex) => {
          const answeredQuestions = section.questions.filter((q) => getAnswerStatus(q)).length
          const totalQuestions = section.questions.length
          const completionPercentage = Math.round((answeredQuestions / totalQuestions) * 100)
          return (
            <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`} className="mb-1 py-4 border-1 rounded-lg">
              <AccordionTrigger className="px-6 py-0 mb-2 hover:no-underline">
                <div className="flex items-center justify-between w-full mr-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                    <h3 className="text-lg font-semibold">{section.name}</h3>
                    <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                      {answeredQuestions}/{totalQuestions} answered
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{completionPercentage}% complete</div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4">
                  {section.questions.map((question, questionIndex) => {
                    const hasAnswer = getAnswerStatus(question)
                    return (
                      <Card
                        key={questionIndex}
                        className={`gap-0 ${hasAnswer ? "border-green-200 bg-green-50/50" : "border-gray-200"}`}
                      >
                        <CardHeader className="pb-1">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base font-medium leading-relaxed">
                              {question.text}
                              {question.isMandatory && <span className="text-red-500 ml-1">*</span>}
                            </CardTitle>
                            <div className="flex gap-2">
                              {question.isMandatory && (
                                <Badge variant="outline" className="text-xs">
                                  Required
                                </Badge>
                              )}
                              <Badge variant={hasAnswer ? "default" : "secondary"} className="text-xs">
                                {hasAnswer ? "Answered" : "No Answer"}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">{renderAnswer(question)}</CardContent>
                      </Card>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
