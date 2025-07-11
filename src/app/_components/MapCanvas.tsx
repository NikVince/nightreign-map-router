"use client";
import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer } from "react-konva";
import { Image as KonvaImage } from "react-konva";

function getTileGridUrls() {
  // 6x6 grid for L0 (surface) tiles
  const rows = 6;
  const cols = 6;
  const basePath = "/assets/maps/default_map_tiles/";
  const urls: string[][] = [];
  for (let row = 0; row < rows; row++) {
    urls[row] = [];
    for (let col = 0; col < cols; col++) {
      const filename = `MENU_MapTile_L0_${row.toString().padStart(2, "0")}_${col.toString().padStart(2, "0")}_webp.webp`;
      urls[row][col] = basePath + filename;
    }
  }
  return urls;
}

const MapCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  const [images, setImages] = useState<(HTMLImageElement | null)[][]>([]);
  const [tileSize, setTileSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

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

  useEffect(() => {
    const urls = getTileGridUrls();
    const imgGrid: (HTMLImageElement | null)[][] = urls.map(row => row.map(() => null));
    let loaded = 0;
    const total = 36;
    let firstImgLoaded = false;
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
        const img = new window.Image();
        img.src = urls[row][col];
        img.onload = () => {
          loaded++;
          imgGrid[row][col] = img;
          // Set tile size from the first loaded image
          if (!firstImgLoaded) {
            setTileSize({ width: img.width, height: img.height });
            firstImgLoaded = true;
          }
          if (loaded === total) {
            setImages(imgGrid);
          }
        };
        img.onerror = () => {
          loaded++;
          if (loaded === total) {
            setImages(imgGrid);
          }
        };
      }
    }
  }, []);

  // No scaling: use natural image size
  return (
    <div ref={containerRef} className="w-full h-full">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        style={{}}
      >
        <Layer>
          {images.length === 6 && tileSize.width > 0 && tileSize.height > 0 &&
            images.map((row, rowIdx) =>
              row.map((img, colIdx) =>
                img ? (
                  <KonvaImage
                    key={`${rowIdx}-${colIdx}`}
                    image={img}
                    x={colIdx * tileSize.width}
                    y={rowIdx * tileSize.height}
                    width={tileSize.width}
                    height={tileSize.height}
                  />
                ) : null
              )
            )}
        </Layer>
      </Stage>
    </div>
  );
};

export default MapCanvas; 