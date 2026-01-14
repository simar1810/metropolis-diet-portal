"use client";

import { Upload } from 'lucide-react';

export default function FileUploadDisplay({ question }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h6 className="font-medium text-gray-900">{question.text}</h6>
        {question.isMandatory && (
          <span className="text-red-500 text-sm">*</span>
        )}
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PDF, DOC, DOCX, JPG, PNG (max 10MB)
        </p>
      </div>
    </div>
  );
}
