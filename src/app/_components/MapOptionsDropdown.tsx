"use client";
import React, { useState } from "react";
import { api } from "~/trpc/react";

interface MapOptionsDropdownProps {
  showIcons: boolean;
  setShowIcons: (show: boolean) => void;
  showTitles: boolean;
  setShowTitles: (show: boolean) => void;
  showNumbers: boolean;
  setShowNumbers: (show: boolean) => void;
  onLayoutChange: (layoutNumber: number) => void;
  currentLayout: number;
  iconToggles: {
    sitesOfGrace: boolean;
    spiritStreams: boolean;
    spiritHawkTrees: boolean;
    scarabs: boolean;
    buriedTreasures: boolean;
  };
  onIconToggleChange: (key: string, value: boolean) => void;
}

export const MapOptionsDropdown: React.FC<MapOptionsDropdownProps> = ({
  showIcons,
  setShowIcons,
  showTitles,
  setShowTitles,
  showNumbers,
  setShowNumbers,
  onLayoutChange,
  currentLayout,
  iconToggles,
  onIconToggleChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(currentLayout.toString());
  const [showDebugOptions, setShowDebugOptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const layoutNumber = parseInt(inputValue);
    if (layoutNumber >= 1 && layoutNumber <= 320) {
      onLayoutChange(layoutNumber);
    }
  };

  return (
    <div className="absolute top-4 left-4 z-20">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded hover:bg-gray-700 flex items-center gap-2"
        >
          <span>Map Options</span>
          <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 p-4 bg-black bg-opacity-90 border border-gray-600 rounded min-w-[280px] backdrop-blur-sm">
            <div className="space-y-4">
              {/* Layout Section */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-2" style={{ color: "var(--elden-accent)" }}>
                  Layout
                </h3>
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="320"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm bg-gray-700 text-white border border-gray-600 rounded"
                    placeholder="1-320"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 text-sm bg-blue-600 text-white border border-blue-500 rounded hover:bg-blue-700"
                  >
                    Load
                  </button>
                </form>
              </div>

              {/* Icon Categories Section */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-2" style={{ color: "var(--elden-accent)" }}>
                  Show Icon Categories
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-white">
                    <input
                      type="checkbox"
                      checked={iconToggles.sitesOfGrace}
                      onChange={e => onIconToggleChange('sitesOfGrace', e.target.checked)}
                      className="w-4 h-4"
                    />
                    Sites of Grace
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white">
                    <input
                      type="checkbox"
                      checked={iconToggles.spiritStreams}
                      onChange={e => onIconToggleChange('spiritStreams', e.target.checked)}
                      className="w-4 h-4"
                    />
                    Spirit Streams
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white">
                    <input
                      type="checkbox"
                      checked={iconToggles.spiritHawkTrees}
                      onChange={e => onIconToggleChange('spiritHawkTrees', e.target.checked)}
                      className="w-4 h-4"
                    />
                    Spirit Hawk Trees
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white">
                    <input
                      type="checkbox"
                      checked={iconToggles.scarabs}
                      onChange={e => onIconToggleChange('scarabs', e.target.checked)}
                      className="w-4 h-4"
                    />
                    Scarabs
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white">
                    <input
                      type="checkbox"
                      checked={iconToggles.buriedTreasures}
                      onChange={e => onIconToggleChange('buriedTreasures', e.target.checked)}
                      className="w-4 h-4"
                    />
                    Buried Treasures
                  </label>
                </div>
              </div>

              {/* Debug Toggle and Options */}
              <div className="p-3 border border-gray-600 rounded bg-black bg-opacity-50">
                <div className="mb-3">
                  <label className="flex items-center gap-2 text-sm text-white">
                    <input
                      type="checkbox"
                      checked={showDebugOptions}
                      onChange={e => setShowDebugOptions(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Show Debug Options
                  </label>
                </div>

                {/* Debug Section - Only show when enabled */}
                {showDebugOptions && (
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2" style={{ color: "var(--elden-accent)" }}>
                      Debug Options
                    </h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-white">
                        <input
                          type="checkbox"
                          checked={showIcons}
                          onChange={e => setShowIcons(e.target.checked)}
                          className="w-4 h-4"
                        />
                        Show Icons
                      </label>
                      <label className="flex items-center gap-2 text-sm text-white">
                        <input
                          type="checkbox"
                          checked={showTitles}
                          onChange={e => setShowTitles(e.target.checked)}
                          className="w-4 h-4"
                        />
                        Show Titles
                      </label>
                      <label className="flex items-center gap-2 text-sm text-white">
                        <input
                          type="checkbox"
                          checked={showNumbers}
                          onChange={e => setShowNumbers(e.target.checked)}
                          className="w-4 h-4"
                        />
                        Show Numbers
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 