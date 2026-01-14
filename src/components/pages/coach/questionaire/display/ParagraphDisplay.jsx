"use client";

import { Textarea } from "@/components/ui/textarea";

export default function ParagraphDisplay({ question }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h6 className="font-medium text-gray-900">{question.text}</h6>
        {question.isMandatory && (
          <span className="text-red-500 text-sm">*</span>
        )}
      </div>

      <Textarea
        placeholder="Your answer"
        className="bg-gray-50 min-h-[80px]"
        disabled
      />
    </div>
  );
}
