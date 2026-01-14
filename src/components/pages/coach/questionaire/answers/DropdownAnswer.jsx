import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DropdownAnswer({
  question,
  onChange,
}) {
  return (
    <div className="space-y-3 py-3 px-4 rounded-[6px] bg-white border-1">
      <div className="flex items-start justify-between">
        <h6 className="font-medium text-gray-900">{question.text}</h6>
      </div>

      <Select
        value={question.answer || ""}
        onValueChange={(value) => onChange(question.id, value)}
      >
        <SelectTrigger className="bg-gray-50">
          <SelectValue placeholder="Choose an option" />
        </SelectTrigger>
        <SelectContent>
          {(question.options || []).map((option, index) => (
            <SelectItem key={index} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

