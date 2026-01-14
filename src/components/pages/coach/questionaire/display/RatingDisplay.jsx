"use client";

import { Star } from 'lucide-react';

export default function RatingDisplay({ question }) {
  const maxRating = question.maxScale || 5;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h6 className="font-medium text-gray-900">{question.text}</h6>
        {question.isMandatory && (
          <span className="text-red-500 text-sm">*</span>
        )}
      </div>

      <div className="flex space-x-1">
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
          <Star
            key={star}
            className="w-6 h-6 text-gray-300 cursor-pointer hover:text-yellow-400"
          />
        ))}
      </div>
    </div>
  );
}
