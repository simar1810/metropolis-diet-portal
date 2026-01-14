"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import MultipleChoiceQuestion from "./creation/MultipleChoiceQuestion";
import ShortAnswerQuestion from "./creation/ShortAnswerQuestion";
import ParagraphQuestion from "./creation/ParagraphQuestion";
import CheckboxQuestion from "./creation/CheckboxQuestion";
import LinearScaleQuestion from "./creation/LinearScaleQuestion";
import RatingQuestion from "./creation/RatingQuestion";
import DateQuestion from "./creation/DateQuestion";
import TimeQuestion from "./TimeQuestion";
import FileUploadQuestion from "./creation/FileUploadQuestion";
import { DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const questionTypes = [
  { value: "shortAnswer", label: "Short Answer" },
  { value: "paragraph", label: "Paragraph" },
  { value: "multipleChoice", label: "Multiple Choice" },
  { value: "checkBoxes", label: "Checkboxes" },
  { value: "dropdown", label: "Dropdown" },
  { value: "linearScale", label: "Linear Scale" },
  { value: "rating", label: "Rating" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "attachFile", label: "File Upload" },
];

export default function QuestionEditor({ question, onUpdate, sectionKey, questionIndex, allSections, onAddNestedSection, onEditNestedSection, onRemoveNestedSection }) {
  const updateQuestion = (updates) => {
    onUpdate({ ...question, ...updates });
  };
  const renderQuestionTypeComponent = () => {
    const nestedProps = {
      sectionKey,
      questionIndex,
      allSections,
      onAddNestedSection,
      onEditNestedSection,
      onRemoveNestedSection
    };

    switch (question.type) {
      case "multipleChoice":
      case "dropdown":
        return <MultipleChoiceQuestion question={question} onUpdate={onUpdate} {...nestedProps} />;
      case "shortAnswer":
        return <ShortAnswerQuestion question={question} onUpdate={onUpdate} />;
      case "paragraph":
        return <ParagraphQuestion question={question} onUpdate={onUpdate} />;
      case "checkBoxes":
        return <CheckboxQuestion question={question} onUpdate={onUpdate} {...nestedProps} />;
      case "linearScale":
        return <LinearScaleQuestion question={question} onUpdate={onUpdate} />;
      case "rating":
        return <RatingQuestion question={question} onUpdate={onUpdate} />;
      case "date":
        return <DateQuestion question={question} onUpdate={onUpdate} />;
      case "time":
        return <TimeQuestion question={question} onUpdate={onUpdate} />;
      case "attachFile":
        return <FileUploadQuestion question={question} onUpdate={onUpdate} />;
      default:
        return <ShortAnswerQuestion question={question} onUpdate={onUpdate} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question-name">Question Name</Label>
        <Input
          id="question-name"
          value={question.name || ""}
          onChange={(e) => updateQuestion({ name: e.target.value })}
          placeholder="Enter question name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="question-type">Question Type</Label>
        <Select
          value={question.type}
          onValueChange={(value) => updateQuestion({ type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select question type" />
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

      {renderQuestionTypeComponent()}
      <DialogClose asChild>
        <Button className="font-bold block mx-auto" variant="wz">Save</Button>
      </DialogClose>
    </div>
  );
}
