import React, { useState, useEffect } from "react";

interface ChurchLocation {
  id: number;
  x: number;
  y: number;
  name: string;
  isSelected: boolean;
}

interface ChurchLocationHighlighterProps {
  nightlord: string;
  event: string;
  onChurchSelection: (selectedChurches: ChurchLocation[]) => void;
  onConfirm: () => void;
}

export function ChurchLocationHighlighter({ 
  nightlord, 
  event, 
  onChurchSelection, 
  onConfirm 
}: ChurchLocationHighlighterProps) {
  const [churchLocations, setChurchLocations] = useState<ChurchLocation[]>([]);
  const [selectedChurches, setSelectedChurches] = useState<ChurchLocation[]>([]);

  // Mock church locations - this will be replaced with actual data from the layout system
  useEffect(() => {
    // TODO: Replace with actual church location data from the layout system
    const mockChurches: ChurchLocation[] = [
      { id: 1, x: 100, y: 100, name: "Church Location 1", isSelected: false },
      { id: 2, x: 200, y: 150, name: "Church Location 2", isSelected: false },
      { id: 3, x: 300, y: 200, name: "Church Location 3", isSelected: false },
      { id: 4, x: 150, y: 300, name: "Church Location 4", isSelected: false },
      { id: 5, x: 250, y: 350, name: "Church Location 5", isSelected: false },
    ];
    
    setChurchLocations(mockChurches);
  }, [nightlord, event]);

  const handleChurchClick = (church: ChurchLocation) => {
    const updatedChurches = churchLocations.map(c => 
      c.id === church.id ? { ...c, isSelected: !c.isSelected } : c
    );
    
    setChurchLocations(updatedChurches);
    
    const newSelectedChurches = updatedChurches.filter(c => c.isSelected);
    setSelectedChurches(newSelectedChurches);
    
    // Notify parent component of selection changes
    onChurchSelection(newSelectedChurches);
  };

  const handleConfirm = () => {
    if (selectedChurches.length > 0) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-4">
          Select Visible Churches
        </h3>
        
        <div className="mb-4 text-gray-300">
          <p>Nightlord: <span className="text-blue-400">{nightlord}</span></p>
          <p>Event: <span className="text-green-400">{event}</span></p>
          <p className="mt-2">Click on the church locations that are visible on your map:</p>
        </div>

        {/* Church Selection Counter */}
        <div className="mb-4 p-3 bg-gray-700 rounded border border-gray-600">
          <p className="text-white">
            Selected Churches: <span className="text-blue-400 font-semibold">{selectedChurches.length}</span>
          </p>
        </div>

        {/* Church Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {churchLocations.map((church) => (
            <div
              key={church.id}
              onClick={() => handleChurchClick(church)}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all
                ${church.isSelected 
                  ? 'bg-blue-600 border-blue-400 text-white' 
                  : 'bg-gray-700 border-gray-500 text-gray-300 hover:border-gray-400'
                }
              `}
            >
              <div className="font-medium">{church.name}</div>
              <div className="text-sm opacity-75">
                Position: ({church.x}, {church.y})
              </div>
              <div className="text-sm mt-1">
                {church.isSelected ? '✓ Selected' : 'Click to select'}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleConfirm}
            disabled={selectedChurches.length === 0}
            className="px-6 py-2 text-sm bg-green-600 text-white border border-green-500 rounded hover:bg-green-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Confirm Selection ({selectedChurches.length})
          </button>
        </div>
      </div>
    </div>
  );
}
