export default function MultipleChoiceAnswer({
  question,
  onChange,
}) {
  return (
    <div className="space-y-3 py-3 px-4 rounded-[6px] bg-white border-1">
      <div className="flex items-start justify-between">
        <h6 className="font-medium text-gray-900">{question.text}</h6>
      </div>
      <div className="space-y-1 pl-4">
        {(question.options || []).map((option, index) => (
          <label key={index} className=" flex items-center gap-x-2 cursor-pointer">
            <input
              type="radio"
              onChange={() => onChange(question.id, option)}
              checked={question.answer === option}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  )
}