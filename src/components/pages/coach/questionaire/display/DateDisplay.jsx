"use client";

import { Input } from "@/components/ui/input";

export default function DateDisplay({ question }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h6 className="font-medium text-gray-900">{question.text}</h6>
        {question.isMandatory && (
          <span className="text-red-500 text-sm">*</span>
        )}
      </div>

      <Input
        type="date"
        className="bg-gray-50"
        disabled
      />
    </div>
  );
}
