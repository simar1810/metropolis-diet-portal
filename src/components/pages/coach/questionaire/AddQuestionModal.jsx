"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { X, Upload, Plus } from 'lucide-react'

const questionTypes = [
  { value: "multiple-choice", label: "Multiple Choice Questions" },
  { value: "text", label: "Text Input" },
  { value: "textarea", label: "Long Text" },
  { value: "number", label: "Number Input" },
  { value: "date", label: "Date Picker" },
  { value: "email", label: "Email Input" }
]

export default function AddQuestionModal({ isOpen, onClose, onSave, section, question }) {
  const [formData, setFormData] = useState({
    sectionName: "",
    questionText: "",
    questionType: "multiple-choice",
    options: [""],
    mandatory: false
  })

  useEffect(() => {
    if (isOpen) {
      if (question) {
        // Editing existing question
        setFormData({
          sectionName: section?.name || "",
          questionText: question.text || "",
          questionType: question.type || "multiple-choice",
          options: question.options || [""],
          mandatory: question.mandatory || false
        })
      } else if (section) {
        // Adding question to existing section
        setFormData({
          sectionName: section.name,
          questionText: "",
          questionType: "multiple-choice",
          options: [""],
          mandatory: false
        })
      } else {
        // Adding new section with question
        setFormData({
          sectionName: "",
          questionText: "",
          questionType: "multiple-choice",
          options: [""],
          mandatory: false
        })
      }
    }
  }, [isOpen, section, question])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }))
  }

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, ""]
    }))
  }

  const removeOption = (index) => {
    if (formData.options.length > 1) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }))
    }
  }

  const handleSave = () => {
    const questionData = {
      text: formData.questionText,
      type: formData.questionType,
      options: formData.questionType === "multiple-choice" ? formData.options.filter(opt => opt.trim()) : [],
      mandatory: formData.mandatory
    }

    onSave(questionData)
  }

  const isMultipleChoice = formData.questionType === "multiple-choice"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Add Client
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="sectionName" className="text-sm font-medium text-gray-700">
              Section Name
            </Label>
            <Input
              id="sectionName"
              value={formData.sectionName}
              onChange={(e) => handleInputChange("sectionName", e.target.value)}
              placeholder="Enter section name"
              className="mt-1"
              disabled={!!section}
            />
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Question No. 1</h3>
              <Select
                value={formData.questionType}
                onValueChange={(value) => handleInputChange("questionType", value)}
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <Textarea
                value={formData.questionText}
                onChange={(e) => handleInputChange("questionText", e.target.value)}
                placeholder="Write Question here"
                className="min-h-[100px]"
              />
            </div>

            {isMultipleChoice && (
              <div className="space-y-3 mb-6">
                <RadioGroup>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <RadioGroupItem value={`option-${index}`} disabled />
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      <Button variant="ghost" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                      {formData.options.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </RadioGroup>

                <Button
                  variant="ghost"
                  onClick={addOption}
                  className="text-green-600 hover:text-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add option or add "Other"
                </Button>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 mb-6">
              <Label htmlFor="mandatory" className="text-sm font-medium">
                Mandatory Question
              </Label>
              <Switch
                id="mandatory"
                checked={formData.mandatory}
                onCheckedChange={(checked) => handleInputChange("mandatory", checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => {/* Add section functionality */ }}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            + Add Section
          </Button>
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white px-8"
            disabled={!formData.questionText.trim()}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
