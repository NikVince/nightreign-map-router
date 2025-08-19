import React, { useState } from "react";
import { Nightlord } from "~/types/core";

interface FindMySeedButtonProps {
  onFindSeed: (nightlord: string, event: string) => void;
  onClearLayout: () => void;
}

export function FindMySeedButton({ onFindSeed, onClearLayout }: FindMySeedButtonProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedNightlord, setSelectedNightlord] = useState<Nightlord | "">("");
  const [selectedEvent, setSelectedEvent] = useState<string>("default");

  const handleFindSeed = () => {
    // Clear current layout first
    onClearLayout();
    // Show the selection popup
    setShowPopup(true);
  };

  const handleContinue = () => {
    if (selectedNightlord && selectedEvent) {
      // Close popup and proceed with seed finding
      setShowPopup(false);
      onFindSeed(selectedNightlord, selectedEvent);
      // Reset selections
      setSelectedNightlord("");
      setSelectedEvent("");
    }
  };

  const handleCancel = () => {
    setShowPopup(false);
    setSelectedNightlord("");
    setSelectedEvent("");
  };

  const nightlordOptions = Object.values(Nightlord);
  const eventOptions = [
    { value: "default", label: "Default Map Layout" },
    { value: "shifting_earth_1", label: "Shifting Earth Event 1" },
    { value: "shifting_earth_2", label: "Shifting Earth Event 2" },
    { value: "shifting_earth_3", label: "Shifting Earth Event 3" }
  ];

  return (
    <>
      {/* Find My Seed Button */}
      <div className="mb-4">
        <button
          onClick={handleFindSeed}
          className="w-full px-4 py-2 text-sm bg-green-600 text-white border border-green-500 rounded hover:bg-green-700 transition-colors"
        >
          Find My Seed
        </button>
      </div>

      {/* Nightlord & Event Selection Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Select Your Game State
            </h3>
            
            {/* Nightlord Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Nightlord *
              </label>
              <select
                value={selectedNightlord}
                onChange={(e) => setSelectedNightlord(e.target.value as Nightlord)}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select Nightlord</option>
                {nightlordOptions.map((nightlord) => (
                  <option key={nightlord} value={nightlord}>
                    {nightlord}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Map Layout Event *
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:border-blue-500 focus:outline-none"
              >
                {eventOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 text-sm bg-gray-600 text-white border border-gray-500 rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                disabled={!selectedNightlord || !selectedEvent}
                className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white border border-blue-500 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
