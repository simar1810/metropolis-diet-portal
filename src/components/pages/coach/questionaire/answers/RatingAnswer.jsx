import { Star } from "lucide-react"
import { useState } from "react"

export default function RatingAnswer({
  question,
  onChange,
}) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const maxScale = question.maxScale || 5;
  const currentRating = question.answer || 0;

  const handleClick = (rating) => {
    onChange(question.id, rating);
  };

  return (
    <div className="space-y-3 py-3 px-4 rounded-[6px] bg-white border-1">
      <div className="flex items-start justify-between">
        <h6 className="font-medium text-gray-900">{question.text}</h6>
      </div>
      <div className="pl-4 flex items-center gap-1">
        {Array.from({ length: maxScale }, (_, i) => i + 1).map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleClick(rating)}
            onMouseEnter={() => setHoveredRating(rating)}
            onMouseLeave={() => setHoveredRating(0)}
            className="cursor-pointer transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${rating <= (hoveredRating || currentRating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
                }`}
            />
          </button>
        ))}
        {currentRating > 0 && (
          <span className="ml-2 text-sm text-gray-600">
            {currentRating} / {maxScale}
          </span>
        )}
      </div>
    </div>
  )
}

