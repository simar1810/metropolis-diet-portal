"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DropdownDisplay({ question }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h6 className="font-medium text-gray-900">{question.text}</h6>
        {question.isMandatory && (
          <span className="text-red-500 text-sm">*</span>
        )}
      </div>

      <Select>
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
  );
}
