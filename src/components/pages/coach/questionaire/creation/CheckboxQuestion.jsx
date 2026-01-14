"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, ChevronRight, Edit } from 'lucide-react';
import { toast } from "sonner";
import { useState } from "react";

export default function CheckboxQuestion({ question, onUpdate, sectionKey, questionIndex, allSections, onAddNestedSection, onEditNestedSection, onRemoveNestedSection }) {
  const [optionErrors, setOptionErrors] = useState({});

  const updateQuestion = (updates) => {
    onUpdate({ ...question, ...updates });
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), ""];
    updateQuestion({ options: newOptions });
  };

  const updateOption = (index, value) => {
    // Check if the option value already exists (excluding the current index)
    const isDuplicate = (question.options || []).some((opt, i) =>
      i !== index && opt.trim() !== "" && value.trim() !== "" && opt.trim().toLowerCase() === value.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast.error("This option already exists. Please enter a unique option.");
      setOptionErrors(prev => ({ ...prev, [index]: true }));
      return;
    }

    // Clear error for this option if it exists
    setOptionErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    updateQuestion({ options: newOptions });
  };

  const removeOption = (index) => {
    const optionText = question.options[index];
    const newOptions = question.options.filter((_, i) => i !== index);

    // Clear error for this option if it exists
    setOptionErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    // Remove nested section mapping if exists
    const newOptionToSectionMap = { ...(question.optionToSectionMap || {}) };
    const nestedSectionKey = newOptionToSectionMap[optionText];
    delete newOptionToSectionMap[optionText];

    updateQuestion({
      options: newOptions,
      optionToSectionMap: newOptionToSectionMap
    });

    // Remove the nested section if it exists
    if (nestedSectionKey && onRemoveNestedSection) {
      onRemoveNestedSection(nestedSectionKey, sectionKey, questionIndex, optionText);
    }
  };

  const handleAddNestedSection = (optionText) => {
    if (onAddNestedSection) {
      onAddNestedSection(optionText, sectionKey, questionIndex);
    }
  };

  const handleEditNestedSection = (optionText) => {
    const nestedSectionKey = question.optionToSectionMap?.[optionText];
    if (nestedSectionKey && onEditNestedSection) {
      onEditNestedSection(nestedSectionKey);
    }
  };

  const getNestedSectionName = (optionText) => {
    const sectionKey = question.optionToSectionMap?.[optionText];
    if (sectionKey && allSections && allSections[sectionKey]) {
      return allSections[sectionKey].name;
    }
    return null;
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
        <Label>Options</Label>
        <div className="space-y-3 mt-2">
          {(question.options || []).map((option, index) => {
            const hasNestedSection = question.optionToSectionMap?.[option];
            const nestedSectionName = getNestedSectionName(option);

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className={optionErrors[index] ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {optionErrors[index] && (
                      <p className="text-xs text-red-500 mt-1">This option already exists</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Nested Section Controls */}
                {option && (
                  <div className="ml-4 flex items-center gap-2">
                    {!hasNestedSection ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddNestedSection(option)}
                        className="text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add nested questions
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-xs bg-blue-50 px-2 py-1 rounded">
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-blue-700">→ {nestedSectionName}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditNestedSection(option)}
                          className="h-5 w-5 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Remove nested section?')) {
                              onRemoveNestedSection(hasNestedSection, sectionKey, questionIndex, option);
                            }
                          }}
                          className="h-5 w-5 p-0 text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <Button type="button" variant="outline" onClick={addOption}>
            <Plus className="w-4 h-4 mr-2" />
            Add Option
          </Button>
        </div>
      </div>
    </div>
  );
}
