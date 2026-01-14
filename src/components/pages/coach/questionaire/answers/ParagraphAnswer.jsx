import { Textarea } from "@/components/ui/textarea"

export default function ParagraphAnswer({
  question,
  onChange,
}) {
  return (
    <div className="space-y-3 py-3 px-4 rounded-[6px] bg-white border-1">
      <div className="flex items-start justify-between">
        <h6 className="font-medium text-gray-900">{question.text}</h6>
      </div>
      <div className="pl-4">
        <Textarea
          value={question.answer || ""}
          onChange={(e) => onChange(question.id, e.target.value)}
          placeholder="Enter your answer here..."
          rows={4}
        />
      </div>
    </div>
  )
}

