"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function DateQuestion({ question, onUpdate }) {
  const updateQuestion = (updates) => {
    onUpdate({ ...question, ...updates });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question-text">Question Text</Label>
        <Input
          id="question-text"
          value={question.text || ""}
          onChange={(e) => updateQuestion({ text: e.target.value })}
          placeholder="Enter your question"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="mandatory"
          checked={question.isMandatory || false}
          onCheckedChange={(checked) => updateQuestion({ isMandatory: checked })}
        />
        <Label htmlFor="mandatory">Required</Label>
      </div>

      <div className="p-3 bg-gray-50 rounded border">
        <Label className="text-sm text-gray-600">Preview</Label>
        <Input type="date" disabled className="mt-2" />
      </div>
    </div>
  );
}
