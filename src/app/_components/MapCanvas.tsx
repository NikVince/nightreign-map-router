"use client";
import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer } from "react-konva";

const MapCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });

  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        style={{}}
      >
        <Layer>{/* Map and landmarks will be rendered here */}</Layer>
      </Stage>
    </div>
  );
};

export default MapCanvas; 