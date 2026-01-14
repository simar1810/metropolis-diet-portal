export default function LinearScaleAnswer({
  question,
  onChange,
}) {
  const minScale = question.minScale || 1;
  const maxScale = question.maxScale || 5;
  const scaleValues = Array.from(
    { length: maxScale - minScale + 1 },
    (_, i) => minScale + i
  );

  return (
    <div className="space-y-3 py-3 px-4 rounded-[6px] bg-white border-1">
      <div className="flex items-start justify-between">
        <h6 className="font-medium text-gray-900">{question.text}</h6>
      </div>
      <div className="pl-4">
        <div className="flex items-center justify-between gap-4 max-w-2xl">
          {question.label1 && (
            <span className="text-sm text-gray-600 min-w-fit">{question.label1}</span>
          )}
          <div className="flex items-center gap-2">
            {scaleValues.map((value) => (
              <label
                key={value}
                className="flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-sm font-medium">{value}</span>
                <input
                  type="radio"
                  name={question.id}
                  value={value}
                  checked={question.answer === value}
                  onChange={() => onChange(question.id, value)}
                  className="w-4 h-4"
                />
              </label>
            ))}
          </div>
          {question.label2 && (
            <span className="text-sm text-gray-600 min-w-fit">{question.label2}</span>
          )}
        </div>
      </div>
    </div>
  )
}

