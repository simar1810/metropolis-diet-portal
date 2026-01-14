import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function FileUploadAnswer({
  question,
  onChange,
}) {
  const [fileName, setFileName] = useState(question.answer?.name || "");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange(question.id, file);
    }
  };

  return (
    <div className="space-y-3 py-3 px-4 rounded-[6px] bg-white border-1">
      <div className="flex items-start justify-between">
        <h6 className="font-medium text-gray-900">{question.text}</h6>
      </div>
      <div className="pl-4">
        <Input
          type="file"
          onChange={handleFileChange}
          className="max-w-md"
        />
        {fileName && (
          <p className="text-sm text-gray-600 mt-2">Selected: {fileName}</p>
        )}
      </div>
    </div>
  )
}

