"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function LinearScaleDisplay({ question }) {
  const minScale = question.minScale || 1;
  const maxScale = question.maxScale || 5;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h6 className="font-medium text-gray-900">{question.text}</h6>
        {question.isMandatory && (
          <span className="text-red-500 text-sm">*</span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{question.label1 || `${minScale}`}</span>
          <span>{question.label2 || `${maxScale}`}</span>
        </div>

        <RadioGroup className="flex justify-between items-center">
          {Array.from(
            { length: maxScale - minScale + 1 },
            (_, i) => minScale + i
          ).map((value) => (
            <div key={value} className="flex flex-col items-center space-y-1">
              <RadioGroupItem
                value={value.toString()}
                id={`scale-${value}`}
              />
              <Label htmlFor={`scale-${value}`} className="text-xs">
                {value}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
