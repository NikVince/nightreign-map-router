"use client";
import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer } from "react-konva";
import { Image as KonvaImage, Text as KonvaText } from "react-konva";
import type { Stage as KonvaStageType } from "konva/lib/Stage";
import type { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";
import useImage from "use-image";

// Add this type definition for our new data structure
interface PoiWithId {
  id: number;
  coordinates: [number, number];
}

function getTileGridUrls(mapLayout: string) {
  // 6x6 grid for L0 (surface) tiles
  const rows = 6;
  const cols = 6;
  let basePath = "/assets/maps/default_map_tiles/";
  if (mapLayout === "the_crater_shifted") basePath = "/assets/maps/the_crater_shifted_map_tiles/";
  else if (mapLayout === "the_mountaintop_shifted") basePath = "/assets/maps/the_mountaintop_shifted_map_tiles/";
  else if (mapLayout === "the_rotten_woods_shifted") basePath = "/assets/maps/the_rotten_woods_shifted_map_tiles/";
  else if (mapLayout === "noklateo_shifted") basePath = "/assets/maps/noklateo_shifted_map_tiles/";
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

// Utility to clamp a value between min and max
function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

// Calculate minimum scale so map height fits canvas
function getMinScale(mapWidth: number, mapHeight: number, canvasWidth: number, canvasHeight: number) {
  if (mapHeight === 0 || canvasHeight === 0) return 0.2;
  return Math.min(1, canvasHeight / mapHeight);
}

// Clamp stage position so map stays in view
function clampStagePos(pos: { x: number; y: number }, scale: number, mapWidth: number, mapHeight: number, canvasWidth: number, canvasHeight: number) {
  const scaledMapWidth = mapWidth * scale;
  const scaledMapHeight = mapHeight * scale;
  // The map should at least cover the canvas
  const minX = Math.min(0, canvasWidth - scaledMapWidth);
  const maxX = Math.max(0, canvasWidth - scaledMapWidth);
  const minY = Math.min(0, canvasHeight - scaledMapHeight);
  const maxY = Math.max(0, canvasHeight - scaledMapHeight);
  return {
    x: clamp(pos.x, minX, maxX),
    y: clamp(pos.y, minY, maxY),
  };
}

// List of all POI icon filenames
const POI_ICONS = [
  "Mission_Objective.png",
  "Main_Encampment.png",
  "Great_Church.png",
  "Fort.png",
  "Field_Boss.png",
  "Evergaol.png",
  "Church.png",
  "Castle.png",
  "Buried_Treasure.png",
  "Tunnel_Entrance.png",
  "Township.png",
  "Spiritstream.png",
  "Spectral_Hawk_Tree.png",
  "Sorcerer's_Rise.png",
  "Site_of_Grace.png",
  "Scarab.png",
  "Ruins.png",
];

// --- MANUAL ICON SIZE CONTROL ---
// Edit the width/height for each icon here to test different sizes in realtime.
// If an icon is not listed, it will use its natural size.
export const POI_ICON_SIZES: Record<string, { width?: number; height?: number }> = {
  "Mission_Objective.png": { width: 64 },
  "Main_Encampment.png": { width: 96 },
  "Great_Church.png": { width: 96 },
  "Fort.png": { width: 128 },
  "Field_Boss.png": { width: 64 },
  "Evergaol.png": { width: 64 },
  "Church.png": { width: 64 },
  "Castle.png": { width: 128 },
  "Buried_Treasure.png": { width: 64 },
  "Tunnel_Entrance.png": { width: 64 },
  "Township.png": { width: 128 },
  "Spiritstream.png": { width: 48 },
  "Spectral_Hawk_Tree.png": { width: 48 },
  "Sorcerer's_Rise.png": { width: 48 },
  "Site_of_Grace.png": { width: 48 },
  "Scarab.png": { width: 48 },
  "Ruins.png": { width: 128 },
};
// ---------------------------------

// Add type for POI data
type POICoordinates = Record<string, [number, number][]>;

// POI type to icon filename mapping
const POI_TYPE_ICON_MAP: Record<string, string> = {
  // Direct matches
  "castle": "Castle.png",
  "Buried_Treasures": "Buried_Treasure.png",
  "Tunnel_Entrances": "Tunnel_Entrance.png",
  "Spiritstreams": "Spiritstream.png",
  "Spectral_Hawk_Trees": "Spectral_Hawk_Tree.png",
  "Smithing_Tables": "Ruins.png", // No direct icon, use Ruins
  "Sites_of_grace": "Site_of_Grace.png",
  "Scarabs": "Scarab.png",
  "Minor_Locations": "Township.png", // No direct icon, use Township
  "Merchants": "Main_Encampment.png", // No direct icon, use Main_Encampment
  "Major_Locations": "Great_Church.png", // No direct icon, use Great_Church
  "Field_Bosses": "Field_Boss.png",
  "Evergaols": "Evergaol.png",
};

const MapCanvas: React.FC<{ mapLayout: string }> = ({ mapLayout }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<KonvaStageType>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 300 });
  const [images, setImages] = useState<(HTMLImageElement | null)[][]>([]);
  const [tileSize, setTileSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPointerPos, setLastPointerPos] = useState<{ x: number; y: number } | null>(null);
  const [showIcons, setShowIcons] = useState(true); // Debug toggle for icons layer
  const [showNumbers, setShowNumbers] = useState(true); // Start with numbers shown

  // Add refs for scale and position
  const stageScaleRef = useRef(stageScale);
  const stagePosRef = useRef(stagePos);

  useEffect(() => {
    stageScaleRef.current = stageScale;
  }, [stageScale]);
  useEffect(() => {
    stagePosRef.current = stagePos;
  }, [stagePos]);

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
    const urls = getTileGridUrls(mapLayout);
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
  }, [mapLayout]);

  // Calculate map size
  const mapWidth = tileSize.width * 6;
  const mapHeight = tileSize.height * 6;
  const minScale = getMinScale(mapWidth, mapHeight, dimensions.width, dimensions.height);

  // Center map in viewport on first load
  useEffect(() => {
    if (mapWidth > 0 && mapHeight > 0 && dimensions.width > 0 && dimensions.height > 0) {
      const scale = getMinScale(mapWidth, mapHeight, dimensions.width, dimensions.height);
      setStageScale(scale);
      setStagePos({
        x: (dimensions.width - mapWidth * scale) / 2,
        y: (dimensions.height - mapHeight * scale) / 2,
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
    setStagePos(pos => {
      const newPos = { x: pos.x + dx, y: pos.y + dy };
      return clampStagePos(newPos, stageScaleRef.current, mapWidth, mapHeight, dimensions.width, dimensions.height);
    });
    setLastPointerPos({ x: e.evt.clientX, y: e.evt.clientY });
  };
  const handleMouseUp = (_e: KonvaEventObject<MouseEvent>) => {
    setIsDragging(false);
    setLastPointerPos(null);
  };

  // --- Touch pan and pinch logic ---
  const lastDistRef = useRef<number | null>(null);
  const lastMidRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    if (touches.length === 1) {
      // Single finger: start pan
      const t0 = touches[0];
      if (!t0) return;
      setIsDragging(true);
      setLastPointerPos({ x: t0.clientX, y: t0.clientY });
    } else if (touches.length === 2) {
      // Two fingers: start pinch
      const t0 = touches[0], t1 = touches[1];
      if (!t0 || !t1) return;
      setIsDragging(false);
      const dx = t0.clientX - t1.clientX;
      const dy = t0.clientY - t1.clientY;
      lastDistRef.current = Math.sqrt(dx * dx + dy * dy);
      lastMidRef.current = {
        x: (t0.clientX + t1.clientX) / 2,
        y: (t0.clientY + t1.clientY) / 2,
      };
    }
  };

  // Add requestAnimationFrame throttling for touchmove
  const rafRef = useRef<number | null>(null);
  const latestTouchMoveEvent = useRef<KonvaEventObject<TouchEvent> | null>(null);

  const processTouchMove = () => {
    if (!latestTouchMoveEvent.current) return;
    const e = latestTouchMoveEvent.current;
    const touches = e.evt.touches;
    if (touches.length === 1 && isDragging && lastPointerPos) {
      const t0 = touches[0];
      if (!t0) return;
      const dx = t0.clientX - lastPointerPos.x;
      const dy = t0.clientY - lastPointerPos.y;
      setStagePos(pos => {
        const newPos = { x: pos.x + dx, y: pos.y + dy };
        return clampStagePos(newPos, stageScaleRef.current, mapWidth, mapHeight, dimensions.width, dimensions.height);
      });
      setLastPointerPos({ x: t0.clientX, y: t0.clientY });
    } else if (touches.length === 2 && lastDistRef.current && lastMidRef.current) {
      const t0 = touches[0], t1 = touches[1];
      if (!t0 || !t1) return;
      const prevDist = lastDistRef.current;
      const prevMid = lastMidRef.current;
      const prevScale = stageScaleRef.current;
      const prevPos = stagePosRef.current;
      const dx = t0.clientX - t1.clientX;
      const dy = t0.clientY - t1.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const mid = {
        x: (t0.clientX + t1.clientX) / 2,
        y: (t0.clientY + t1.clientY) / 2,
      };
      const scaleBy = dist / prevDist;
      let newScale = prevScale * scaleBy;
      newScale = clamp(newScale, minScale, 4);
      const pointTo = {
        x: (prevMid.x - prevPos.x) / prevScale,
        y: (prevMid.y - prevPos.y) / prevScale,
      };
      const newPos = {
        x: mid.x - pointTo.x * newScale,
        y: mid.y - pointTo.y * newScale,
      };
      setStageScale(newScale);
      setStagePos(clampStagePos(newPos, newScale, mapWidth, mapHeight, dimensions.width, dimensions.height));
      lastDistRef.current = dist;
      lastMidRef.current = mid;
    }
    latestTouchMoveEvent.current = null;
    rafRef.current = null;
  };

  const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
    latestTouchMoveEvent.current = e;
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(processTouchMove);
    }
  };

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleTouchEnd = (e: KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    if (touches.length === 0) {
      setIsDragging(false);
      setLastPointerPos(null);
      lastDistRef.current = null;
      lastMidRef.current = null;
    } else if (touches.length === 1) {
      // If one finger remains, start pan from its position
      const t0 = touches[0];
      if (!t0) return;
      setIsDragging(true);
      setLastPointerPos({ x: t0.clientX, y: t0.clientY });
      lastDistRef.current = null;
      lastMidRef.current = null;
    }
  };

  // Zoom logic (mouse wheel and pinch)
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const oldScale = stageScale;
    const pointer = stageRef.current?.getPointerPosition?.();
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
    newScale = clamp(newScale, minScale, 4);
    // Adjust position to zoom to pointer
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setStageScale(newScale);
    setStagePos(clampStagePos(newPos, newScale, mapWidth, mapHeight, dimensions.width, dimensions.height));
  };

  // Pinch zoom for touch
  // (Simple version: only supports two-finger pinch, not rotation)
  // This function is no longer needed as pinch logic is handled by handleTouchMove
  // const handleTouchPinch = (e: KonvaEventObject<TouchEvent>) => {
  //   const [touch1, touch2] = e.evt?.touches ?? [];
  //   if (!touch1 || !touch2) return;
  //   const dist = Math.sqrt(
  //     Math.pow((touch1?.clientX ?? 0) - (touch2?.clientX ?? 0), 2) +
  //     Math.pow((touch1?.clientY ?? 0) - (touch2?.clientY ?? 0), 2)
  //   );
  //   if (lastDistRef.current !== null) {
  //     const scaleBy = 1.02;
  //     let newScale = stageScale;
  //     if (dist > lastDistRef.current) {
  //       newScale = stageScale * scaleBy;
  //     } else if (dist < lastDistRef.current) {
  //       newScale = stageScale / scaleBy;
  //     }
  //     newScale = Math.max(0.2, Math.min(4, newScale));
  //     setStageScale(newScale);
  //   }
  //   lastDistRef.current = dist;
  // };
  // const handleTouchPinchEnd = (e: KonvaEventObject<TouchEvent>) => {
  //   // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  //   const touchesLength = e.evt?.touches?.length ?? 0;
  //   if (touchesLength < 2) {
  //     lastDistRef.current = null;
  //   }
  // };

  useEffect(() => {
    // Global Konva performance settings
    Konva.hitOnDragEnabled = true;
    Konva.pixelRatio = 1; // For better performance on retina
  }, []);

  // Individual useImage calls for each POI icon (must be at top level, not in a loop)
  const missionObjectiveImg = useImage("/POI_icons/Mission_Objective.png")[0];
  const mainEncampmentImg = useImage("/POI_icons/Main_Encampment.png")[0];
  const greatChurchImg = useImage("/POI_icons/Great_Church.png")[0];
  const fortImg = useImage("/POI_icons/Fort.png")[0];
  const fieldBossImg = useImage("/POI_icons/Field_Boss.png")[0];
  const evergaolImg = useImage("/POI_icons/Evergaol.png")[0];
  const churchImg = useImage("/POI_icons/Church.png")[0];
  const castleImg = useImage("/POI_icons/Castle.png")[0];
  const buriedTreasureImg = useImage("/POI_icons/Buried_Treasure.png")[0];
  const tunnelEntranceImg = useImage("/POI_icons/Tunnel_Entrance.png")[0];
  const townshipImg = useImage("/POI_icons/Township.png")[0];
  const spiritstreamImg = useImage("/POI_icons/Spiritstream.png")[0];
  const spectralHawkTreeImg = useImage("/POI_icons/Spectral_Hawk_Tree.png")[0];
  const sorcerersRiseImg = useImage("/POI_icons/Sorcerer's_Rise.png")[0];
  const siteOfGraceImg = useImage("/POI_icons/Site_of_Grace.png")[0];
  const scarabImg = useImage("/POI_icons/Scarab.png")[0];
  const ruinsImg = useImage("/POI_icons/Ruins.png")[0];

  // Assemble in the same order as POI_ICONS
  const poiImages = [
    missionObjectiveImg,
    mainEncampmentImg,
    greatChurchImg,
    fortImg,
    fieldBossImg,
    evergaolImg,
    churchImg,
    castleImg,
    buriedTreasureImg,
    tunnelEntranceImg,
    townshipImg,
    spiritstreamImg,
    spectralHawkTreeImg,
    sorcerersRiseImg,
    siteOfGraceImg,
    scarabImg,
    ruinsImg,
  ];

  // State for loaded POI coordinates
  const [poiData, setPoiData] = useState<POICoordinates | null>(null);
  const [poiMasterList, setPoiMasterList] = useState<PoiWithId[]>([]);

  // Helper to get coordinate file path based on mapLayout
  function getCoordinateJsonPath(layout: string) {
    switch (layout) {
      case "noklateo_shifted":
        return "/assets/maps/coordinates/noklateo_map_layout.json";
      case "the_crater_shifted":
        return "/assets/maps/coordinates/the_crater_map_layout.json";
      case "the_mountaintop_shifted":
        return "/assets/maps/coordinates/the_mountaintop_map_layout.json";
      case "the_rotten_woods_shifted":
        return "/assets/maps/coordinates/the_rotten_woods_map_layout.json";
      case "default":
      default:
        return "/assets/maps/coordinates/default_map_layout.json";
    }
  }

  // Load the master POI list with unique IDs
  useEffect(() => {
    fetch("/assets/maps/poi_coordinates_with_ids.json")
      .then((res) => res.json())
      .then((data: PoiWithId[]) => setPoiMasterList(data))
      .catch(() => setPoiMasterList([]));
  }, []);

  // Load POI coordinates from JSON whenever mapLayout changes
  useEffect(() => {
    const jsonPath = getCoordinateJsonPath(mapLayout);
    fetch(jsonPath)
      .then((res) => {
        if (!res.ok) throw new Error("File not found");
        return res.json();
      })
      .then((data: POICoordinates) => setPoiData(data))
      .catch((_err) => {
        // Fallback to default if file not found
        if (mapLayout !== "default") {
          fetch("/assets/maps/coordinates/default_map_layout.json")
            .then((res) => res.json())
            .then((data: POICoordinates) => setPoiData(data))
            .catch(() => setPoiData(null));
        } else {
          setPoiData(null);
        }
      });
  }, [mapLayout]);

  // DERIVED STATE: Create a clean, unique list of POIs to render for the current map layout.
  // This is the core fix: we process all coordinates first, handle duplicates,
  // find their master IDs, and then pass a clean list to the rendering logic.
  const poisToRender = React.useMemo(() => {
    if (!poiData || poiMasterList.length === 0) {
      return [];
    }

    const uniquePois = new Map<string, { id: number; x: number; y: number; poiType: string }>();
    const epsilon = 0.01;

    Object.entries(poiData).forEach(([poiType, coords]) => {
      coords.forEach(([x, y]) => {
        // Find the canonical POI info from the master list using a tolerance check
        const poiInfo = poiMasterList.find(
          p => Math.abs(p.coordinates[0] - x) < epsilon && Math.abs(p.coordinates[1] - y) < epsilon
        );

        if (poiInfo) {
          const coordKey = `${poiInfo.coordinates[0]},${poiInfo.coordinates[1]}`;
          // If we haven't seen this canonical coordinate yet, add it to our list to be rendered.
          if (!uniquePois.has(coordKey)) {
            uniquePois.set(coordKey, {
              id: poiInfo.id,
              x: poiInfo.coordinates[0],
              y: poiInfo.coordinates[1],
              poiType: poiType, // Store the type to determine the icon later
            });
          }
        }
      });
    });

    return Array.from(uniquePois.values());
  }, [poiData, poiMasterList]);

  useEffect(() => {
    console.log("--- POI DATA DEBUG ---");
    console.log("Current mapLayout:", mapLayout);
    if (poiData && poiMasterList.length > 0) {
      console.log("poiMasterList loaded:", poiMasterList.length, "entries. First 5:", poiMasterList.slice(0, 5));
      console.log("poiData loaded for layout:", Object.keys(poiData).length, "categories");

      const firstCategory = Object.keys(poiData)[0];
      const firstCoordsArray = firstCategory ? poiData[firstCategory] : undefined;
      
      if (firstCoordsArray && firstCoordsArray.length > 0) {
        const firstCoord = firstCoordsArray[0];
        if(firstCoord){
          console.log(`Testing lookup for first coordinate in layout: [${firstCoord[0]}, ${firstCoord[1]}]`);
          
          const epsilon = 0.01;
          const foundPoi = poiMasterList.find(
            p => Math.abs(p.coordinates[0] - firstCoord[0]) < epsilon && Math.abs(p.coordinates[1] - firstCoord[1]) < epsilon
          );

          if (foundPoi) {
            console.log("LOOKUP SUCCESS:", foundPoi);
          } else {
            console.log("LOOKUP FAILED for", firstCoord);
            console.log("This means the coordinate from the layout file does not have a close match in poi_coordinates_with_ids.json");
          }
        }
      }
    } else {
      console.log("Data not fully loaded yet (poiData or poiMasterList is missing).");
    }
    console.log("--- END POI DATA DEBUG ---");
  }, [poiData, poiMasterList, mapLayout]);

  return (
    <div ref={containerRef} className="w-full h-full flex-1" style={{ position: 'relative' }}>
      {/* Debug toggle for icons layer */}
      <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 20, background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: 4 }}>
        <label style={{ color: '#fff', fontSize: 14 }}>
          <input
            type="checkbox"
            checked={showIcons}
            onChange={e => setShowIcons(e.target.checked)}
            style={{ marginRight: 6 }}
          />
          Show icons layer
        </label>
        <br />
        <label style={{ color: '#fff', fontSize: 14 }}>
          <input
            type="checkbox"
            checked={showNumbers}
            onChange={e => setShowNumbers(e.target.checked)}
            style={{ marginRight: 6 }}
          />
          Show POI numbers
        </label>
      </div>
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        <Layer listening={false}>
          {images.length === 6 && tileSize.width > 0 && tileSize.height > 0 &&
            // Rotate the grid 90 degrees counterclockwise: (row, col) -> (5 - col, row)
            [...Array(6).keys()].map(newRow =>
              [...Array(6).keys()].map(newCol => {
                const oldRow = newCol;
                const oldCol = 5 - newRow;
                const img = images[oldRow]?.[oldCol];
                return img && img.width && img.height ? (
                  <KonvaImage
                    key={`${oldRow}_${(oldCol + 1).toString().padStart(2, "0")}`}
                    image={img}
                    x={newCol * tileSize.width}
                    y={newRow * tileSize.height}
                    width={tileSize.width}
                    height={tileSize.height}
                    perfectDrawEnabled={false}
                  />
                ) : null;
              })
            )}
        </Layer>
        {/* Landmark Layer */}
        {(showIcons || showNumbers) && (
          <Layer listening={false}>
            {/* Render every POI from our clean, processed list */}
            {poisToRender.map((poi) => {
              const { id, x, y, poiType } = poi;

              // Determine icon based on the poiType we stored
              const iconFile = POI_TYPE_ICON_MAP[poiType] || POI_TYPE_ICON_MAP.Default;
              if (!iconFile) return null;

              const iconIndex = POI_ICONS.indexOf(iconFile);
              const img = iconIndex >= 0 ? poiImages[iconIndex] : poiImages[0];
              if (!img) return null;

              const size = POI_ICON_SIZES[iconFile] ?? {};
              
              let displayWidth = img.width || 32;
              let displayHeight = img.height || 32;
                if (size.width && !size.height) {
                  displayWidth = size.width;
                  displayHeight = img ? (img.height / img.width) * size.width : size.width;
                } else if (!size.width && size.height) {
                  displayHeight = size.height;
                  displayWidth = img ? (img.width / img.height) * size.height : size.height;
                } else if (size.width && size.height) {
                  displayWidth = size.width;
                  displayHeight = size.height;
                }

                const leftBound = 507;
                const activeWidth = 1690;

                  const scaledX = ((x - leftBound) / activeWidth) * mapWidth;
                  const scaledY = (y / 1690) * mapHeight;

              return (
                <React.Fragment key={id}>
                      {showIcons && img && (
                        <KonvaImage
                          image={img}
                          x={scaledX - displayWidth / 2}
                          y={scaledY - displayHeight / 2}
                          width={displayWidth}
                          height={displayHeight}
                        />
                      )}
                      {showNumbers && (
                        <>
                          <KonvaImage
                            image={undefined}
                            x={scaledX - 24}
                            y={scaledY - 16}
                            width={48}
                            height={32}
                            fill="#fff"
                            stroke="#000"
                            strokeWidth={1}
                            cornerRadius={8}
                            listening={false}
                          />
                          <KonvaText
                        text={String(id)}
                            x={scaledX - 24}
                            y={scaledY - 16}
                            fontSize={18}
                            fontFamily="Arial"
                            fill="#000"
                            align="center"
                            width={48}
                            height={32}
                            listening={false}
                            verticalAlign="middle"
                          />
                        </>
                      )}
                    </React.Fragment>
                  );
            })}
          </Layer>
        )}
      </Stage>
    </div>
  );
};

export default MapCanvas;