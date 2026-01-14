"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function CheckboxDisplay({ question }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h6 className="font-medium text-gray-900">{question.text}</h6>
        {question.isMandatory && (
          <span className="text-red-500 text-sm">*</span>
        )}
      </div>

      <div className="space-y-2">
        {(question.options || []).map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox id={`checkbox-${index}`} />
            <Label htmlFor={`checkbox-${index}`} className="text-sm">
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
