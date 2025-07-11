"use client";
import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer } from "react-konva";
import { Image as KonvaImage } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";

function getTileGridUrls() {
  // 6x6 grid for L0 (surface) tiles
  const rows = 6;
  const cols = 6;
  const basePath = "/assets/maps/default_map_tiles/";
  const urls: string[][] = [];
  for (let row = 0; row < rows; row++) {
    const rowArr: string[] = [];
    for (let col = 0; col < cols; col++) {
      const filename = `MENU_MapTile_L0_${row.toString().padStart(2, "0")}_${col.toString().padStart(2, "0")}_webp.webp`;
      rowArr.push(basePath + filename);
    }
    urls.push(rowArr);
  }
  return urls;
}

const MapCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  const [images, setImages] = useState<(HTMLImageElement | null)[][]>([]);
  const [tileSize, setTileSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointerPos, setLastPointerPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    function updateSize() {
      if (containerRef.current && typeof containerRef.current.offsetWidth === 'number' && typeof containerRef.current.offsetHeight === 'number') {
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
    urls.forEach((rowArr, rowIdx) => {
      rowArr.forEach((url, colIdx) => {
        if (!url) return;
        const img = new window.Image();
        img.src = url;
        img.onload = () => {
          loaded++;
          if (imgGrid[rowIdx]) {
            imgGrid[rowIdx][colIdx] = img;
          }
          // Set tile size from the first loaded image
          if (!firstImgLoaded && img && img.width && img.height) {
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
      });
    });
  }, []);

  // Calculate map size
  const mapWidth = tileSize.width * 6;
  const mapHeight = tileSize.height * 6;

  // Center map in viewport on first load
  useEffect(() => {
    if (mapWidth > 0 && mapHeight > 0 && dimensions.width > 0 && dimensions.height > 0) {
      setStagePos({
        x: (dimensions.width - mapWidth) / 2,
        y: (dimensions.height - mapHeight) / 2,
      });
    }
  }, [mapWidth, mapHeight, dimensions.width, dimensions.height]);

  // Pan logic
  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    setIsDragging(true);
    setLastPointerPos({ x: e.evt.clientX, y: e.evt.clientY });
  };
  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDragging || !lastPointerPos) return;
    const dx = e.evt.clientX - lastPointerPos.x;
    const dy = e.evt.clientY - lastPointerPos.y;
    setStagePos(pos => ({ x: pos.x + dx, y: pos.y + dy }));
    setLastPointerPos({ x: e.evt.clientX, y: e.evt.clientY });
  };
  const handleMouseUp = (_e: KonvaEventObject<MouseEvent>) => {
    setIsDragging(false);
    setLastPointerPos(null);
  };

  // Touch pan logic
  const handleTouchStart = (e: KonvaEventObject<TouchEvent>) => {
    if (e.evt?.touches?.length === 1 && e.evt.touches[0]) {
      setIsDragging(true);
      setLastPointerPos({ x: e.evt.touches[0].clientX, y: e.evt.touches[0].clientY });
    }
  };
  const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
    if (!isDragging || !lastPointerPos || e.evt?.touches?.length !== 1 || !e.evt.touches[0]) return;
    const dx = e.evt.touches[0].clientX - lastPointerPos.x;
    const dy = e.evt.touches[0].clientY - lastPointerPos.y;
    setStagePos(pos => ({ x: pos.x + dx, y: pos.y + dy }));
    setLastPointerPos({ x: e.evt.touches[0].clientX, y: e.evt.touches[0].clientY });
  };
  const handleTouchEnd = (_e: KonvaEventObject<TouchEvent>) => {
    setIsDragging(false);
    setLastPointerPos(null);
  };

  // Zoom logic (mouse wheel and pinch)
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const oldScale = stageScale;
    if (!stageRef.current || typeof stageRef.current.getPointerPosition !== 'function') return;
    const pointer = stageRef.current.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };
    let newScale = oldScale;
    if (e.evt.deltaY > 0) {
      newScale = oldScale / scaleBy;
    } else if (e.evt.deltaY < 0) {
      newScale = oldScale * scaleBy;
    }
    // Clamp scale
    newScale = Math.max(0.2, Math.min(4, newScale));
    // Adjust position to zoom to pointer
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setStageScale(newScale);
    setStagePos(newPos);
  };

  // Pinch zoom for touch
  // (Simple version: only supports two-finger pinch, not rotation)
  const lastDistRef = useRef<number | null>(null);
  const handleTouchPinch = (e: KonvaEventObject<TouchEvent>) => {
    if (e.evt?.touches?.length === 2) {
      const [touch1, touch2] = e.evt.touches;
      if (!touch1 || !touch2) return;
      const dist = Math.sqrt(
        Math.pow(touch1.clientX - touch2.clientX, 2) +
        Math.pow(touch1.clientY - touch2.clientY, 2)
      );
      if (lastDistRef.current !== null) {
        const scaleBy = 1.02;
        let newScale = stageScale;
        if (dist > lastDistRef.current) {
          newScale = stageScale * scaleBy;
        } else if (dist < lastDistRef.current) {
          newScale = stageScale / scaleBy;
        }
        newScale = Math.max(0.2, Math.min(4, newScale));
        setStageScale(newScale);
      }
      lastDistRef.current = dist;
    }
  };
  const handleTouchPinchEnd = (e: KonvaEventObject<TouchEvent>) => {
    if (e.evt?.touches && e.evt.touches.length < 2) {
      lastDistRef.current = null;
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full">
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={e => { handleTouchStart(e); handleTouchPinch(e); }}
        onTouchMove={e => { handleTouchMove(e); handleTouchPinch(e); }}
        onTouchEnd={e => { handleTouchEnd(e); handleTouchPinchEnd(e); }}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <Layer>
          {images.length === 6 && tileSize.width > 0 && tileSize.height > 0 &&
            images.map((row, rowIdx) =>
              row.map((img, colIdx) =>
                img && img.width && img.height ? (
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