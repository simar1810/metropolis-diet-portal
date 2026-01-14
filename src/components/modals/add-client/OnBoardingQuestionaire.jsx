import { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import ContentLoader from "@/components/common/ContentLoader";
import ContentError from "@/components/common/ContentError";
import { retrieveQuestionaire } from "@/lib/fetchers/app";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star } from "lucide-react"
import { sendData } from "@/lib/api";
import { toast } from "sonner";
import { useAppSelector } from "@/providers/global/hooks";
import useCurrentStateContext from "@/providers/CurrentStateContext";
import { clientOnboardingCompleted } from "@/config/state-reducers/add-client-checkup";
import MultipleChoiceDisplay from "@/components/pages/coach/questionaire/display/MultipleChoiceDisplay";
import MultipleChoiceAnswer from "@/components/pages/coach/questionaire/answers/MultipleChoiceAnswer";
import CheckboxAnswer from "@/components/pages/coach/questionaire/answers/CheckboxAnswer";
import DateAnswer from "@/components/pages/coach/questionaire/answers/DateAnswer";
import DropdownAnswer from "@/components/pages/coach/questionaire/answers/DropdownAnswer";
import FileUploadAnswer from "@/components/pages/coach/questionaire/answers/FileUploadAnswer";
import LinearScaleAnswer from "@/components/pages/coach/questionaire/answers/LinearScaleAnswer";
import ParagraphAnswer from "@/components/pages/coach/questionaire/answers/ParagraphAnswer";
import RatingAnswer from "@/components/pages/coach/questionaire/answers/RatingAnswer";
import ShortAnswerAnswer from "@/components/pages/coach/questionaire/answers/ShortAnswerAnswer";
import { _throwError } from "@/lib/formatter";

export default function OnBoardingQuestionaire() {
  const { isLoading, error, data } = useSWR("app/questionaire", () => retrieveQuestionaire({ person: "coach" }));

  if (isLoading) return <ContentLoader />

  if (error || data.status_code !== 200) return <ContentError title={error || data.message} />
  const sections = data.data?.sections || [];

  return <div>
    <QuestionsContainer sections={sections} />
  </div>
}

function getInitialFormState(sections = []) {
  return sections.map((section) => ({
    ...section,
    questions: section
      .questions
      .map((question, questionIdx) => ({
        ...question,
        id: `${section._id}-${questionIdx}`,
        answer: ""
      }))
  }))
}

function generateQuestionaireRP(
  clientId,
  sections = [],
  hiddenSections
) {
  return {
    clientId,
    sections: sections
      .filter(section => !hiddenSections.has(section._id))
      .map((section) => ({
        name: section.name,
        questions: section.questions
          .filter(question => Boolean(question.answer))
          .map((question) => {
            if (question.type === "attachFile") {

              if (!question.answer) return null;

              const fileName =
                question.answer instanceof File
                  ? question.answer.name
                  : question.answer;

              return {
                text: question.text,
                type: question.type,
                filePath: fileName,
                answer: ""
              };
            }

            return {
              text: question.text,
              type: question.type,
              answer: Array.isArray(question.answer)
                ? question.answer.join(", ")
                : (question.answer ?? "")
            };
          })
          .filter(q => q !== null)
      }))
      .filter(section => section.questions.length > 0)
  };
}

function QuestionsContainer({ sections = [] }) {
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState(getInitialFormState(sections));
  const { clientId, dispatch } = useCurrentStateContext();

  const hiddenSections = new Set(
    formState
      .flatMap(section =>
        section
          .questions
          .filter(question => Boolean(question.optionsWithRedirects))
          .flatMap(question => question
            .optionsWithRedirects
            .filter(option => question.answer !== option.text)
            .map(({ sectionId }) => sectionId)
          )
      )
  )

  const toBeAnswered = formState
    .filter(section => !hiddenSections.has(section._id))
  function onChange(questionId, answer) {
    setFormState(prev => (
      prev.map(section => ({
        ...section,
        questions: section
          .questions
          .map((question, index) => ({
            ...question,
            answer: `${section._id}-${index}` === questionId ? answer : question.answer
          }))
      }))
    ))
  }


  async function saveClientQuestionaire() {
    try {
      setLoading(true);
      const payload = generateQuestionaireRP(clientId, formState, hiddenSections);
      const response = await sendData("app/onboarding/questionaire/client?person=coach", payload);
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
      dispatch(clientOnboardingCompleted());
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="max-w-4xl mx-auto p-4">
      <Accordion type="single" collapsible className="w-full">
        {toBeAnswered?.map((section) =>
          <Section
            section={section}
            key={section._id}
            onChange={onChange}
          />
        )}
      </Accordion>
      <Button
        variant="wz"
        className="w-full mt-8"
        disabled={loading}
        onClick={saveClientQuestionaire}
      >Save</Button>
    </div>
  )
}

function Section({ section, onChange }) {
  return <div>
    <AccordionItem
      className="bg-gray-100 p-4 border-1 my-4"
      value={section._id}
    >
      <AccordionTrigger className="text-lg font-bold py-0">{section.name}</AccordionTrigger>
      <AccordionContent>
        {section
          .questions
          .map((question, idx) => <div
            key={question._id || idx}
            className="my-4"
          >
            <RenderQuestion
              question={{
                ...question,
                id: `${section._id}-${idx}`
              }}
              onChange={onChange}
            />
          </div>)}
      </AccordionContent>
    </AccordionItem>
  </div>
}

function RenderQuestion({ question, onChange }) {
  if (question.type === "multipleChoice") {
    return <MultipleChoiceAnswer question={question} onChange={onChange} />
  }

  if (question.type === "checkBoxes") {
    return <CheckboxAnswer question={question} onChange={onChange} />
  }

  if (question.type === "date") {
    return <DateAnswer question={question} onChange={onChange} />
  }

  if (question.type === "dropdown") {
    return <DropdownAnswer question={question} onChange={onChange} />
  }

  if (question.type === "attachFile") {
    return <FileUploadAnswer question={question} onChange={onChange} />
  }

  if (question.type === "linearScale") {
    return <LinearScaleAnswer question={question} onChange={onChange} />
  }

  if (question.type === "paragraph") {
    return <ParagraphAnswer question={question} onChange={onChange} />
  }

  if (question.type === "rating") {
    return <RatingAnswer question={question} onChange={onChange} />
  }

  if (question.type === "shortAnswer") {
    return <ShortAnswerAnswer question={question} onChange={onChange} />
  }

  return null;
}