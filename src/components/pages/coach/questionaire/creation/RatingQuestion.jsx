"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function RatingQuestion({ question, onUpdate }) {
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

      <div>
        <Label htmlFor="max-rating">Maximum Rating</Label>
        <Input
          id="max-rating"
          type="number"
          min="1"
          max="10"
          value={question.maxScale || 5}
          onChange={(e) => updateQuestion({ maxScale: parseInt(e.target.value) })}
        />
      </div>
    </div>
  );
}
