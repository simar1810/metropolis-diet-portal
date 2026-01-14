"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function LinearScaleQuestion({ question, onUpdate }) {
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="min-scale">Minimum Scale</Label>
          <Input
            id="min-scale"
            type="number"
            value={question.minScale || 1}
            onChange={(e) => updateQuestion({ minScale: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="max-scale">Maximum Scale</Label>
          <Input
            id="max-scale"
            type="number"
            value={question.maxScale || 5}
            onChange={(e) => updateQuestion({ maxScale: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="label1">Low Label</Label>
          <Input
            id="label1"
            value={question.label1 || ""}
            onChange={(e) => updateQuestion({ label1: e.target.value })}
            placeholder="e.g., Not Satisfied"
          />
        </div>
        <div>
          <Label htmlFor="label2">High Label</Label>
          <Input
            id="label2"
            value={question.label2 || ""}
            onChange={(e) => updateQuestion({ label2: e.target.value })}
            placeholder="e.g., Very Satisfied"
          />
        </div>
      </div>
    </div>
  );
}
