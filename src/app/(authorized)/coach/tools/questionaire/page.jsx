"use client";
import ContentError from "@/components/common/ContentError";
import ContentLoader from "@/components/common/ContentLoader";
import CheckboxDisplay from "@/components/pages/coach/questionaire/display/CheckboxDisplay";
import DateDisplay from "@/components/pages/coach/questionaire/display/DateDisplay";
import DropdownDisplay from "@/components/pages/coach/questionaire/display/DropdownDisplay";
import FileUploadDisplay from "@/components/pages/coach/questionaire/display/FileUploadDisplay";
import LinearScaleDisplay from "@/components/pages/coach/questionaire/display/LinearScaleDisplay";
import MultipleChoiceDisplay from "@/components/pages/coach/questionaire/display/MultipleChoiceDisplay";
import ParagraphDisplay from "@/components/pages/coach/questionaire/display/ParagraphDisplay";
import RatingDisplay from "@/components/pages/coach/questionaire/display/RatingDisplay";
import ShortAnswerDisplay from "@/components/pages/coach/questionaire/display/ShortAnswerDisplay";
import TimeDisplay from "@/components/pages/coach/questionaire/display/TimeDisplay";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { onboardingQuestionaire } from "@/lib/fetchers/app";
import Link from "next/link";
import useSWR from "swr";

export default function Page() {
  const { isLoading, error, data } = useSWR("onboarding-questionaire", () => onboardingQuestionaire());

  if (isLoading) return <ContentLoader />

  if (error || data?.status_code !== 200) return <ContentError title={error || data?.message} />
  const sections = data.data.sections || []

  return <div className="content-container content-height-screen">
    <div className="flex items-center justify-between gap-5 md:gap-0">
      <h4 className="text-xs md:text-base">Onboarding Questions</h4>
      <Link
        className="px-4 py-2 font-bold bg-[var(--accent-1)] text-white rounded-[8px]"
        href="/coach/tools/questionaire/edit"
        variant="wz"
      >
        Edit
      </Link>
    </div>
    <OnboardingQuestionContainer sections={sections} />
  </div>
}

export function OnboardingQuestionContainer({ sections }) {
  // Create a map of sectionId to section for looking up nested sections
  const sectionMap = {};
  sections.forEach(section => {
    sectionMap[section.sectionId || section._id] = section;
  });

  // Separate normal and nested sections
  const normalSections = sections.filter(s => !s.isNested);
  const nestedSections = sections.filter(s => s.isNested);

  return (
    <div className="mt-10 space-y-8">
      {/* Main Sections */}
      <div>
        <h5 className="mb-4 text-gray-700">Main Sections</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {normalSections.map(section => (
            <SectionDisplay key={section._id} section={section} sectionMap={sectionMap} />
          ))}
        </div>
      </div>

      {/* Nested Sections */}
      {nestedSections.length > 0 && (
        <div>
          <h5 className="mb-4 text-gray-700 flex items-center gap-2">
            <span>Nested Sections</span>
            <span className="text-xs text-gray-500">(shown when specific options are selected)</span>
          </h5>
          <div className="grid grid-col-1 md:grid-cols-2 gap-4">
            {nestedSections.map(section => (
              <SectionDisplay key={section._id} section={section} sectionMap={sectionMap} isNested={true} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionDisplay({ section, sectionMap, isNested = false }) {
  return (
    <Collapsible>
      <CollapsibleTrigger className={`w-full text-left font-bold px-4 py-2 border-1 ${isNested ? 'bg-blue-50 border-blue-200' : 'bg-[var(--comp-1)]'
        }`}>
        <div className="flex items-center gap-2">
          {section.name}
          {isNested && (
            <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded">
              Nested
            </span>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className={`p-4 rounded-b-[4px] border-1 ${isNested ? 'bg-blue-50 border-blue-200' : 'bg-[var(--comp-1)]'
        }`}>
        <h5>Questions - ({section.questions.length})</h5>
        <div className="mt-4">
          {section.questions.map((question, index) => (
            <QuestionDetails
              key={index}
              index={index}
              question={question}
              sectionMap={sectionMap}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function QuestionDetails({ index, question, sectionMap }) {
  const hasNestedSections = question.optionToSectionMap && Object.keys(question.optionToSectionMap).length > 0;

  return (
    <Collapsible className="mb-2">
      <CollapsibleTrigger className="font-bold w-full text-left bg-white px-4 py-1 border-1">
        <div className="flex items-center justify-between">
          <span>{index}{")"} {question.text}</span>
          {hasNestedSections && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
              Has nested sections
            </span>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="bg-white p-4 border-1 rounded-[4px] space-y-3">
        {renderQuestionDisplayComponent(question)}

        {/* Show nested section mappings */}
        {hasNestedSections && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-700 font-medium mb-2">Nested Section Redirects:</div>
            <div className="space-y-1">
              {Object.entries(question.optionToSectionMap).map(([optionText, sectionId]) => {
                const nestedSection = sectionMap[sectionId];
                return (
                  <div key={optionText} className="text-xs text-blue-600 ml-2">
                    "{optionText}" → {nestedSection?.name || 'Unknown Section'}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function renderQuestionDisplayComponent(question) {
  switch (question.type) {
    case "multipleChoice":
      return <MultipleChoiceDisplay question={question} />;
    case "dropdown":
      return <DropdownDisplay question={question} />;
    case "shortAnswer":
      return <ShortAnswerDisplay question={question} />;
    case "paragraph":
      return <ParagraphDisplay question={question} />;
    case "checkBoxes":
      return <CheckboxDisplay question={question} />;
    case "linearScale":
      return <LinearScaleDisplay question={question} />;
    case "rating":
      return <RatingDisplay question={question} />;
    case "date":
      return <DateDisplay question={question} />;
    case "time":
      return <TimeDisplay question={question} />;
    case "attachFile":
      return <FileUploadDisplay question={question} />;
    default:
      return <ShortAnswerDisplay question={question} />;
  }
};