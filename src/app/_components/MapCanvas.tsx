import React from 'react';
import { Stage, Layer } from 'react-konva';

const MapCanvas: React.FC = () => {
  return (
    <Stage width={800} height={600} style={{ border: '1px solid #ccc' }}>
      <Layer>
        {/* Map and landmarks will be rendered here */}
      </Layer>
    </Stage>
  );
};

export default MapCanvas; 