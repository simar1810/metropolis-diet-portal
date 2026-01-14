import { Checkbox } from "@/components/ui/checkbox"

export default function CheckboxAnswer({
  question,
  onChange,
}) {
  const selectedOptions = Array.isArray(question.answer) ? question.answer : [];

  const handleCheckboxChange = (option, checked) => {
    let newAnswer;
    if (checked) {
      newAnswer = [...selectedOptions, option];
    } else {
      newAnswer = selectedOptions.filter(item => item !== option);
    }
    onChange(question.id, newAnswer);
  };

  return (
    <div className="space-y-3 py-3 px-4 rounded-[6px] bg-white border-1">
      <div className="flex items-start justify-between">
        <h6 className="font-medium text-gray-900">{question.text}</h6>
      </div>
      <div className="space-y-2 pl-4">
        {(question.options || []).map((option, index) => (
          <div key={index} className="flex items-center gap-x-2">
            <Checkbox
              id={`${question.id}-${index}`}
              checked={selectedOptions.includes(option)}
              onCheckedChange={(checked) => handleCheckboxChange(option, checked)}
            />
            <label
              htmlFor={`${question.id}-${index}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

