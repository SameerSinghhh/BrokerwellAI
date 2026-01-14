"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  isProcessing: boolean;
}

export default function UploadArea({ onFileSelect, selectedFile, isProcessing }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { user } = useAuth();

  if (!user) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      if (files[0].type === "application/pdf") {
        onFileSelect(files[0]);
      } else {
        alert("Please upload a PDF file");
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (files[0].type === "application/pdf") {
        onFileSelect(files[0]);
      } else {
        alert("Please upload a PDF file");
      }
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        isDragging
          ? "border-primary-500 bg-primary-50"
          : "border-gray-300 bg-white"
      } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-6xl mb-4">📋</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {selectedFile ? selectedFile.name : "Upload Your ACORD Form"}
      </h3>
      <p className="text-gray-600 mb-6">
        {selectedFile
          ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
          : "Drag and drop your PDF here, or click to browse"}
      </p>
      <input
        type="file"
        id="pdf-upload"
        accept="application/pdf"
        onChange={handleFileInput}
        className="hidden"
        disabled={isProcessing}
      />
      <label htmlFor="pdf-upload">
        <span className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors cursor-pointer">
          {selectedFile ? "Choose Different File" : "Choose File"}
        </span>
      </label>
      {selectedFile && !isProcessing && (
        <button
          onClick={() => onFileSelect(null as any)}
          className="ml-4 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}





