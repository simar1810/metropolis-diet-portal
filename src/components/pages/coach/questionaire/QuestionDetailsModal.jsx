"use client";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Minus } from 'lucide-react';
import QuestionEditor from "./QuestionEditor";
import { removeQuestion, updateQuestion, addNestedSection, removeNestedSection } from "@/config/state-reducers/questionaire";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { cn } from "@/lib/utils";

export default function QuestionDetailsModal({ sectionKey, question, index, onEditNestedSection }) {
  const { dispatch, sections } = useCurrentStateContext();

  const handleQuestionUpdate = (updatedQuestion) => {
    dispatch(updateQuestion({
      sectionKey,
      questionIndex: index,
      questionData: updatedQuestion
    }));
  };

  const handleRemoveQuestion = () => {
    dispatch(removeQuestion({ sectionKey, index }));
  };

  const handleAddNestedSection = (optionText, parentSectionKey, questionIndex) => {
    dispatch(addNestedSection({
      optionText,
      parentSectionKey,
      questionIndex
    }));
  };

  const handleRemoveNestedSection = (nestedSectionKey, parentSectionKey, questionIndex, optionText) => {
    dispatch(removeNestedSection({
      sectionKey: nestedSectionKey,
      parentSectionKey,
      questionIndex,
      optionText
    }));
  };

  return (
    <Dialog>
      <div className="bg-white flex items-center justify-between px-4 py-2 border-1 mb-2">
        <DialogTrigger className="grow  flex items-center justify-between">
          <p className={cn("h-[20px]", !Boolean(question.text) && "text-gray-400")}>{question.text || <>Add Question Text</>}</p>
        </DialogTrigger>
        <Minus
          className="w-[18px] h-[18px] bg-[var(--accent-2)] text-white p-[2px] rounded-full cursor-pointer"
          onClick={handleRemoveQuestion}
        />
      </div>
      <DialogContent className="p-0 max-w-[600px] w-full max-h-[80vh] overflow-y-auto gap-0">
        <DialogTitle className="p-4 border-b-1">
          Edit Question: {question.text}
        </DialogTitle>
        <div className="p-4 overflow-y-auto">
          <QuestionEditor
            question={question}
            onUpdate={handleQuestionUpdate}
            sectionKey={sectionKey}
            questionIndex={index}
            allSections={sections}
            onAddNestedSection={handleAddNestedSection}
            onEditNestedSection={onEditNestedSection}
            onRemoveNestedSection={handleRemoveNestedSection}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
