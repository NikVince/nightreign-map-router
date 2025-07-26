"use client";
import React, { useState } from "react";
import { api } from "~/trpc/react";

interface LayoutSelectorProps {
  onLayoutChange: (layoutNumber: number) => void;
  currentLayout: number;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({ onLayoutChange, currentLayout }) => {
  const [inputValue, setInputValue] = useState(currentLayout.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const layoutNumber = parseInt(inputValue);
    if (layoutNumber >= 1 && layoutNumber <= 320) {
      onLayoutChange(layoutNumber);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-800 rounded">
      <label htmlFor="layout-input" className="text-sm text-white">
        Layout:
      </label>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          id="layout-input"
          type="number"
          min="1"
          max="320"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-16 px-2 py-1 text-sm bg-gray-700 text-white border border-gray-600 rounded"
        />
        <button
          type="submit"
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Load
        </button>
      </form>
    </div>
  );
}; 