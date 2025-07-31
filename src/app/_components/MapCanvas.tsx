"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";
import { Stage, Layer } from "react-konva";
import { Image as KonvaImage, Text as KonvaText, Line as KonvaLine } from "react-konva";
import type { Stage as KonvaStageType } from "konva/lib/Stage";
import type { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";
import useImage from "use-image";
import type { IconToggles } from "./MainPanel";
import { api } from "~/trpc/react";

// Add this type definition for our new data structure
interface PoiWithId {
  id: number;
  coordinates: [number, number];
}

// Type for rendered POI data
interface RenderedPOI {
  id: number;
  x: number;
  y: number;
  poiType: string;
  icon?: string;
  value?: string;
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
  // --- New icons ---
  "Event.png",
  "Night_Location.png",
  "Scale_Bearing_Merchant.png",
  "Spawn_Location.png",
  "Arena_Boss.png",
];

// --- MANUAL ICON SIZE CONTROL ---
// Edit the width/height for each icon here to test different sizes in realtime.
// If an icon is not listed, it will use its natural size.
export const POI_ICON_SIZES: Record<string, { width?: number; height?: number }> = {
  "Mission_Objective.png": { width: 64 },
  "Main_Encampment.png": { width: 96 },
  "Great_Church.png": { width: 128 },
  "Fort.png": { width: 128 },
  "Field_Boss.png": { width: 64 },
  "Evergaol.png": { width: 64 },
  "Church.png": { width: 64 },
  "Castle.png": { width: 128 },
  "Buried_Treasure.png": { width: 48 },
  "Tunnel_Entrance.png": { width: 48 },
  "Township.png": { width: 96 },
  "Spiritstream.png": { width: 32 },
  "Spectral_Hawk_Tree.png": { width: 48 },
  "Sorcerer's_Rise.png": { width: 48 },
  "Site_of_Grace.png": { width: 48 },
  "Scarab.png": { width: 32 },
  "Ruins.png": { width: 96 },
  // --- New sizes ---
  "Event.png": { width: 96 },
  "Night_Location.png": { width: 96 },
  "Scale_Bearing_Merchant.png": { width: 48 },
  // --- Add spawn location icon size ---
  "Spawn_Location.png": { width: 128 },
};
// ---------------------------------

// Add type for POI data
type POICoordinates = Record<string, [number, number][]>;

// POI type to icon filename mapping
const POI_TYPE_ICON_MAP: Record<string, string> = {
  // Direct matches
  "castle": "Field_Boss.png", // Placeholder icon for Castle
  "Castle": "Field_Boss.png", // Robustness for case
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
  // --- Custom mission objective icons ---
  "Mountaintops_Buff": "Mission_Objective.png",
  "Rot_Blessing": "Mission_Objective.png",
  // --- New mappings ---
  "Event_Locations": "Event.png",
  "Circle_Locations": "Night_Location.png",
  "Scale_Bearing_Merchant_Locations": "Scale_Bearing_Merchant.png",
  // --- Add spawn location mapping ---
  "Spawn_Locations": "Spawn_Location.png",
};

const MapCanvas: React.FC<{ iconToggles: IconToggles, layoutNumber?: number }> = ({ iconToggles, layoutNumber }) => {
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
  // Add a toggle for showing all POI titles (except central castle)
  const [showTitles, setShowTitles] = useState(true);
  const [showNumbers, setShowNumbers] = useState(false); // Start with numbers hidden by default

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
  const eventImg = useImage("/POI_icons/Event.png")[0];
  const nightLocationImg = useImage("/POI_icons/Night_Location.png")[0];
  const scaleBearingMerchantImg = useImage("/POI_icons/Scale_Bearing_Merchant.png")[0];
  // --- Add spawn location image ---
  const spawnLocationImg = useImage("/POI_icons/Spawn_Location.png")[0];

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
    eventImg,
    nightLocationImg,
    scaleBearingMerchantImg,
    // --- Add spawn location image to array ---
    spawnLocationImg,
  ];

  // State for loaded POI coordinates
  const [poiData, setPoiData] = useState<POICoordinates | null>(null);
  const [poiMasterList, setPoiMasterList] = useState<PoiWithId[]>([]);

  // Dynamic POI data from layout
  const { data: dynamicPOIData } = api.poi.getDynamicPOIs.useQuery(
    { 
      layoutNumber: layoutNumber || 1, 
      mapLayout: "default" // This will be overridden by the returned mapLayout
    },
    { 
      enabled: !!layoutNumber,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Debug logging for dynamic POI data
  useEffect(() => {
    if (dynamicPOIData) {
      console.log('Dynamic POI data:', {
        layoutNumber: dynamicPOIData.layoutNumber,
        sorcerersRiseLocations: dynamicPOIData.sorcerersRiseLocations,
        dynamicPOIs: dynamicPOIData.dynamicPOIs?.filter(poi => poi.icon === "Sorcerer's_Rise.png")
      });
    }
  }, [dynamicPOIData]);

  // Use the mapLayout from dynamic data if available, otherwise fall back to default
  const effectiveMapLayout = dynamicPOIData?.mapLayout || "default";

  // Helper function to format boss names with line breaks
  const formatBossName = (bossName: string): string => {
    const words = bossName.split(' ');
    if (words.length <= 1) return bossName;
    
    // Find the middle point to split
    const midPoint = Math.ceil(words.length / 2);
    return words.slice(0, midPoint).join(' ') + '\n' + words.slice(midPoint).join(' ');
  };

  // Unified text overlay system with collision detection
  const TextOverlay: React.FC<{
    text: string;
    x: number;
    y: number;
    priority: number;
    id: string;
  }> = ({ text, x, y, priority, id }) => {
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
    
    // Calculate text bounds (approximate)
    const fontSize = 21;
    const lineHeight = fontSize * 1.2;
    const lines = text.split('\n').length;
    const textHeight = lines * lineHeight;
    const textWidth = Math.max(...text.split('\n').map(line => line.length * fontSize * 0.6)) || 0;
    
    // Collision detection and repositioning
    useEffect(() => {
      // This is a simplified collision detection
      // In a full implementation, you'd compare with all other text bounds
      const baseX = x;
      const baseY = y;
      
      // Try different offset positions in order of preference
      const offsetPositions = [
        { x: 0, y: 0 },      // Original position
        { x: 0, y: -textHeight - 10 }, // Above
        { x: 0, y: textHeight + 10 },  // Below
        { x: -textWidth - 10, y: 0 },  // Left
        { x: textWidth + 10, y: 0 },   // Right
        { x: -textWidth - 10, y: -textHeight - 10 }, // Top-left
        { x: textWidth + 10, y: -textHeight - 10 },  // Top-right
        { x: -textWidth - 10, y: textHeight + 10 },  // Bottom-left
        { x: textWidth + 10, y: textHeight + 10 },   // Bottom-right
      ];
      
      // For now, use the first position (original)
      // TODO: Implement full collision detection with other text elements
      setOffsetX(offsetPositions[0]?.x || 0);
      setOffsetY(offsetPositions[0]?.y || 0);
    }, [x, y, textWidth, textHeight]);
    
    return (
      <KonvaText
        text={text}
        x={x + offsetX}
        y={y + offsetY}
        fontSize={fontSize}
        fontFamily="Arial"
        fill="#000000"
        align="center"
        listening={false}
        fontStyle="bold"
        offsetX={0}
        offsetY={0}
        shadowColor="#FFFFFF"
        shadowBlur={8}
        shadowOpacity={1}
        shadowOffset={{ x: 0, y: 0 }}
        stroke="#FFFFFF"
        strokeWidth={0.05}
        zIndex={1000 + priority} // Ensure text appears above icons
      />
    );
  };

  useEffect(() => {
    const urls = getTileGridUrls(effectiveMapLayout);
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
  }, [effectiveMapLayout]);

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

  // Load POI coordinates from JSON whenever effectiveMapLayout changes
  useEffect(() => {
    const jsonPath = getCoordinateJsonPath(effectiveMapLayout);
    fetch(jsonPath)
      .then((res) => {
        if (!res.ok) throw new Error("File not found");
        return res.json();
      })
      .then((data: POICoordinates) => setPoiData(data))
      .catch((_err) => {
        // Fallback to default if file not found
        if (effectiveMapLayout !== "default") {
          fetch("/assets/maps/coordinates/default_map_layout.json")
            .then((res) => res.json())
            .then((data: POICoordinates) => setPoiData(data))
            .catch(() => setPoiData(null));
        } else {
          setPoiData(null);
        }
      });
  }, [effectiveMapLayout]);

  // DERIVED STATE: Create a clean, unique list of POIs to render for the current map layout.
  // This combines both dynamic POIs (from layout files) and fixed POIs (from coordinate files)
  const poisToRender = useMemo((): RenderedPOI[] => {
    const allPOIs: RenderedPOI[] = [];
    
    // 1. Add dynamic POIs from layout files (if available)
    if (dynamicPOIData && dynamicPOIData.dynamicPOIs.length > 0) {
      const dynamicPOIs = dynamicPOIData.dynamicPOIs.map(poi => ({
        id: poi.id,
        x: poi.coordinates[0],
        y: poi.coordinates[1],
        poiType: poi.type,
        icon: poi.icon,
        value: poi.value,
      }));
      allPOIs.push(...dynamicPOIs);
    }

    // 2. Add fixed POIs from coordinate files (Sites of Grace, Spirit Streams, etc.)
    // EXCLUDE: Spawn_Locations, Event_Locations, Scale_Bearing_Merchant_Locations
    // These should only appear when specified in layout JSON files
    if (poiData && poiMasterList.length > 0) {
      const uniquePois = new Map<string, { id: number; x: number; y: number; poiType: string }>();
      const epsilon = 0.01;

              Object.entries(poiData).forEach(([poiType, coords]) => {
          // Skip the new POI types that should only appear when specified in layout JSON
          if (poiType === "Spawn_Locations" || poiType === "Event_Locations" || poiType === "Scale_Bearing_Merchant_Locations" || poiType === "Circle_Locations" || poiType === "Merchants" || poiType === "Smithing_Tables") {
            return;
          }
          
          // Special handling for Minor_Locations - only render POI 131 (Church) in crater layouts
          if (poiType === "Minor_Locations") {
            if (effectiveMapLayout === "the_crater_shifted") {
              // Only include POI 131 (Church) from Minor_Locations in crater
              coords.forEach(([x, y]) => {
                const poiInfo = poiMasterList.find(
                  p => Math.abs(p.coordinates[0] - x) < epsilon && Math.abs(p.coordinates[1] - y) < epsilon
                );
                if (poiInfo && poiInfo.id === 131) {
                  const coordKey = `${poiInfo.coordinates[0]},${poiInfo.coordinates[1]}`;
                  if (!uniquePois.has(coordKey)) {
                    uniquePois.set(coordKey, {
                      id: poiInfo.id,
                      x: poiInfo.coordinates[0],
                      y: poiInfo.coordinates[1],
                      poiType: poiType,
                    });
                  }
                }
              });
            }
            return; // Skip other Minor_Locations processing
          }

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

      // Filter out POIs with id 24, 25, and 26 so they do not appear on the map.
      // IMPORTANT: These should also be ignored by the route algorithm when implemented.
      let filtered = Array.from(uniquePois.values()).filter(poi => ![24, 25, 26].includes(poi.id));
      
      // Filter out POI 88 from crater layouts (it should not appear in crater)
      if (effectiveMapLayout === "the_crater_shifted") {
        filtered = filtered.filter(poi => poi.id !== 88);
      }

      // Filter by icon category toggles
      const categoryMap = {
        sitesOfGrace: "Sites_of_grace",
        spiritStreams: "Spiritstreams",
        spiritHawkTrees: "Spectral_Hawk_Trees",
        scarabs: "Scarabs",
        buriedTreasures: "Buried_Treasures",
      };
      filtered = filtered.filter(poi => {
        if (poi.poiType === categoryMap.sitesOfGrace && !iconToggles.sitesOfGrace) return false;
        if (poi.poiType === categoryMap.spiritStreams && !iconToggles.spiritStreams) return false;
        if (poi.poiType === categoryMap.spiritHawkTrees && !iconToggles.spiritHawkTrees) return false;
        if (poi.poiType === categoryMap.scarabs && !iconToggles.scarabs) return false;
        if (poi.poiType === categoryMap.buriedTreasures && !iconToggles.buriedTreasures) return false;
        return true;
      });
      
      // Add fixed POIs to the combined list
      allPOIs.push(...filtered);
    }

    // 3. Remove duplicates based on coordinates (dynamic POIs take precedence)
    const uniquePOIs = new Map<string, RenderedPOI>();
    allPOIs.forEach(poi => {
      const coordKey = `${poi.x},${poi.y}`;
      // Only add if we haven't seen this coordinate before, or if this is a dynamic POI
      if (!uniquePOIs.has(coordKey) || poi.icon) {
        uniquePOIs.set(coordKey, poi);
      }
    });

    return Array.from(uniquePOIs.values());
  }, [poiData, poiMasterList, iconToggles, dynamicPOIData]);

  // Debug logging for poisToRender
  useEffect(() => {
    if (poisToRender.length > 0) {
      const sorcerersRisePOIs = poisToRender.filter(poi => poi.icon === "Sorcerer's_Rise.png");
      if (sorcerersRisePOIs.length > 0) {
        console.log('Sorcerer\'s Rise POIs in poisToRender:', sorcerersRisePOIs);
      } else {
        console.log('No Sorcerer\'s Rise POIs found in poisToRender');
        console.log('All POIs in poisToRender:', poisToRender.map(poi => ({ id: poi.id, icon: poi.icon, value: poi.value })));
      }
    }
  }, [poisToRender]);

  // --- Collision-avoiding POI title placement ---
  // Helper to get bounding box for a text overlay
  function getTextBounds(x: number, y: number, text: string, fontSize = 21) {
    const lines = text.split('\n');
    const lineHeight = fontSize * 1.2;
    const textHeight = lines.length * lineHeight;
    const textWidth = Math.max(...lines.map(line => line.length * fontSize * 0.6)) || 0;
    return {
      left: x - textWidth / 2,
      right: x + textWidth / 2,
      top: y - textHeight / 2,
      bottom: y + textHeight / 2,
      width: textWidth,
      height: textHeight,
    };
  }

  // Precompute all POI title positions (except castle)
  const titlePlacements = useMemo(() => {
    if (!showTitles) return [];
    const placed: { id: number, x: number, y: number, text: string, priority: number }[] = [];
    const allTitles: { id: number, x: number, y: number, text: string, priority: number }[] = [];
    
    // Coordinate transformation constants
    const leftBound = 507;
    const activeWidth = 1690;
    const maxMovementDistance = 48; // Maximum pixels a text can move from its icon center
    
    // Hardcoded titles for mountaintops field bosses and major locations
    const mountaintopsHardcodedTitles: Record<number, string> = {
      140: "Flying Dragon",
      141: "Mountaintop Ice Dragon",
      142: "Mountaintop Ice Dragon", 
      143: "Demi-Human Swordmaster",
      144: "Giant Crows",
      145: "Mountaintop Ice Dragon",
      146: "Demi-Human Swordmaster",
      147: "Mountaintop Ice Dragon",
      148: "Snowfield Trolls",
      149: "Albinauric Archers"
    };
    
    // Hardcoded titles for crater field bosses and special cases
    const craterHardcodedTitles: Record<number, string> = {
      132: "Red Wolf",
      133: "Demi-Human Queen",
      134: "Fire Prelates",
      135: "Demi-Human Queen",
      136: "Magma Wyrm",
      137: "Fallingstar Beast",
      138: "Valiant Gargoyle",
      91: "Flying Dragon" // Special case: POI 91 is Flying Dragon only in crater layouts
    };
    
    // Gather all titles (Evergaols, Field Bosses, etc.)
    poisToRender.forEach((poi) => {
      const { id, x, y, poiType, icon } = poi;
      if (id === 159) return; // skip castle
      
      // Apply the same coordinate transformation as used for POI icons
      const scaledX = ((x - leftBound) / activeWidth) * mapWidth;
      const scaledY = (y / 1690) * mapHeight;
      
      // Check for hardcoded titles based on map layout
      let hardcodedTitle: string | undefined;
      
      if (effectiveMapLayout === "the_mountaintop_shifted" && mountaintopsHardcodedTitles[id]) {
        hardcodedTitle = mountaintopsHardcodedTitles[id];
      } else if (effectiveMapLayout === "the_crater_shifted" && craterHardcodedTitles[id]) {
        hardcodedTitle = craterHardcodedTitles[id];
      }
      
      if (hardcodedTitle) {
        allTitles.push({ id, x: scaledX, y: scaledY, text: formatBossName(hardcodedTitle), priority: 2 });
        return; // Skip dynamic title assignment for hardcoded POIs
      }
      
      // Evergaol
      if ((icon === "Evergaol.png" || poiType === "Evergaols") && dynamicPOIData?.evergaolBosses) {
        const found = dynamicPOIData.evergaolBosses.find((b: { id: number; boss: string }) => b.id === id);
        if (found) allTitles.push({ id, x: scaledX, y: scaledY, text: formatBossName(found.boss), priority: 1 });
      }
      // Field Boss
      if ((icon === "Field_Boss.png" || poiType === "Field_Bosses") && dynamicPOIData?.fieldBosses) {
        const found = dynamicPOIData.fieldBosses.find((b: { id: number; boss: string }) => b.id === id);
        if (found) allTitles.push({ id, x: scaledX, y: scaledY, text: formatBossName(found.boss), priority: 2 });
      }
      // Major Location
      if ((icon === "Ruins.png" || icon === "Main_Encampment.png" || icon === "Great_Church.png" || icon === "Fort.png" || icon === "Church.png" || icon === "Township.png") && dynamicPOIData?.majorLocations) {
        const found = dynamicPOIData.majorLocations.find((m: { id: number; location: string }) => m.id === id);
        if (found) {
          allTitles.push({ id, x: scaledX, y: scaledY, text: formatBossName(found.location), priority: 3 });
        }
      }
      // Night Circle
      if (icon === "Night_Location.png" && dynamicPOIData?.nightCircles) {
        const found = dynamicPOIData.nightCircles.find((n: { id: number; boss: string; night: number }) => n.id === id);
        if (found) {
          const nightText = `Night ${found.night}\n${formatBossName(found.boss)}`;
          allTitles.push({ id, x: scaledX, y: scaledY, text: nightText, priority: 0 }); // Priority 0 for highest priority
        }
      }
      // Sorcerer's Rise
      if (icon === "Sorcerer's_Rise.png" && dynamicPOIData?.sorcerersRiseLocations) {
        const found = dynamicPOIData.sorcerersRiseLocations.find((s: { id: number; location: string }) => s.id === id);
        if (found) {
          console.log('Found Sorcerer\'s Rise title:', { id, location: found.location, text: formatBossName(found.location) });
          allTitles.push({ id, x: scaledX, y: scaledY, text: formatBossName(found.location), priority: 4 }); // Priority 4 for sorcerer's rise
        } else {
          console.log('Sorcerer\'s Rise icon found but no matching data:', { id, icon, sorcerersRiseLocations: dynamicPOIData.sorcerersRiseLocations });
        }
      }
      // Special Events (Meteor Strike, Frenzy Tower, etc.)
      if (icon === "Event.png" && dynamicPOIData?.layoutData?.["Special Event"]) {
        const specialEvent = dynamicPOIData.layoutData["Special Event"];
        if (specialEvent && specialEvent !== "empty") {
          // Extract day and event type from special event string
          // Format: "Day X Event Type" (e.g., "Day 2 Meteor Strike", "Day 2 Frenzy Tower")
          const eventMatch = specialEvent.match(/Day (\d+) (.+)/);
          if (eventMatch) {
            const day = eventMatch[1];
            const eventType = eventMatch[2];
            
            // For frenzy towers, they are present from the start, so don't specify day
            if (eventType === "Frenzy Tower") {
              const eventText = `Frenzy Tower`;
              allTitles.push({ id, x: scaledX, y: scaledY, text: eventText, priority: 1 }); // Priority 1 for special events
            } else {
              // For meteor strikes, they happen on a specific day
              const eventText = `Day ${day}\n${eventType}`;
              allTitles.push({ id, x: scaledX, y: scaledY, text: eventText, priority: 1 }); // Priority 1 for special events
            }
          }
        }
      }
    });
    
    // Sort by priority (lower = higher priority)
    allTitles.sort((a, b) => a.priority - b.priority);
    
    // Bidirectional collision resolution with movement limits
    for (const title of allTitles) {
      let currentPos = { x: title.x, y: title.y };
      let needsRepositioning = true;
      let iterations = 0;
      const maxIterations = 10; // Prevent infinite loops
      
      while (needsRepositioning && iterations < maxIterations) {
        needsRepositioning = false;
        iterations++;
        
        const currentBounds = getTextBounds(currentPos.x, currentPos.y, title.text);
        
        // Check for collisions with already placed titles
        for (const placedTitle of placed) {
          const placedBounds = getTextBounds(placedTitle.x, placedTitle.y, placedTitle.text);
          
          // Check if there's a collision
          const collision = !(
            currentBounds.right < placedBounds.left ||
            currentBounds.left > placedBounds.right ||
            currentBounds.bottom < placedBounds.top ||
            currentBounds.top > placedBounds.bottom
          );
          
          if (collision) {
            // Calculate the minimum movement needed to resolve collision
            const dx = Math.max(0, placedBounds.right - currentBounds.left + 5, currentBounds.right - placedBounds.left + 5);
            const dy = Math.max(0, placedBounds.bottom - currentBounds.top + 5, currentBounds.bottom - placedBounds.top + 5);
            
            // Determine the best direction to move both texts
            const centerX = (currentPos.x + placedTitle.x) / 2;
            const centerY = (currentPos.y + placedTitle.y) / 2;
            
            // Calculate movement for current title
            let moveX = currentPos.x < centerX ? -dx/2 : dx/2;
            let moveY = currentPos.y < centerY ? -dy/2 : dy/2;
            
            // Limit movement to maxMovementDistance from original position
            const distanceFromOriginal = Math.sqrt(moveX * moveX + moveY * moveY);
            if (distanceFromOriginal > maxMovementDistance) {
              const scale = maxMovementDistance / distanceFromOriginal;
              moveX *= scale;
              moveY *= scale;
            }
            
            // Calculate movement for placed title (opposite direction)
            let placedMoveX = -moveX;
            let placedMoveY = -moveY;
            
            // Limit placed title movement to maxMovementDistance from its original position
            const placedDistanceFromOriginal = Math.sqrt(
              Math.pow(placedTitle.x - title.x + placedMoveX, 2) + 
              Math.pow(placedTitle.y - title.y + placedMoveY, 2)
            );
            if (placedDistanceFromOriginal > maxMovementDistance) {
              const scale = maxMovementDistance / placedDistanceFromOriginal;
              placedMoveX *= scale;
              placedMoveY *= scale;
            }
            
            currentPos = {
              x: currentPos.x + moveX,
              y: currentPos.y + moveY
            };
            
            // Also move the placed title in the opposite direction
            placedTitle.x += placedMoveX;
            placedTitle.y += placedMoveY;
            
            needsRepositioning = true;
            break;
          }
        }
      }
      
      placed.push({ ...title, x: currentPos.x, y: currentPos.y });
    }
    
    return placed;
  }, [poisToRender, dynamicPOIData, showTitles, mapWidth, mapHeight]);

  // Debug logging for titlePlacements
  useEffect(() => {
    if (titlePlacements.length > 0) {
      const sorcerersRiseTitles = titlePlacements.filter(title => {
        const poi = poisToRender.find(p => p.id === title.id);
        return poi?.icon === "Sorcerer's_Rise.png";
      });
      if (sorcerersRiseTitles.length > 0) {
        console.log('Sorcerer\'s Rise titles in titlePlacements:', sorcerersRiseTitles);
      } else {
        console.log('No Sorcerer\'s Rise titles found in titlePlacements');
        console.log('All titles in titlePlacements:', titlePlacements);
      }
    }
  }, [titlePlacements, poisToRender]);


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
        {/* Toggle for showing all POI titles */}
        <label style={{ color: '#fff', fontSize: 14 }}>
          <input
            type="checkbox"
            checked={showTitles}
            onChange={e => setShowTitles(e.target.checked)}
            style={{ marginRight: 6 }}
          />
          Show POI titles
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
        {/* Debug/Test Path Layer: Draw a red line between POI 183 and 103 */}
        {/*
        <Layer listening={false}>
          {(() => {
            // Find POI 183 and 103 in the master list
            const poiA = poiMasterList.find(p => p.id === 183);
            const poiB = poiMasterList.find(p => p.id === 103);
            if (!poiA || !poiB) return null;
            // Coordinate conversion (same as icon rendering)
            const leftBound = 507;
            const activeWidth = 1690;
            const scaledXA = ((poiA.coordinates[0] - leftBound) / activeWidth) * mapWidth;
            const scaledYA = (poiA.coordinates[1] / 1690) * mapHeight;
            const scaledXB = ((poiB.coordinates[0] - leftBound) / activeWidth) * mapWidth;
            const scaledYB = (poiB.coordinates[1] / 1690) * mapHeight;
            return (
              <KonvaLine
                points={[scaledXA, scaledYA, scaledXB, scaledYB]}
                stroke="red"
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
                dashEnabled={false}
                opacity={0.9}
              />
            );
          })()}
        </Layer>
        */}
        {/* Landmark Layer */}
        {(showIcons || showNumbers) && (
          <Layer listening={false}>
            {/* Render every POI from our clean, processed list */}
            {poisToRender.map((poi) => {
              const { id, x, y, poiType, icon, value } = poi;
              
              // Debug logging for Sorcerer's Rise POIs
              if (icon === "Sorcerer's_Rise.png") {
                console.log('Rendering Sorcerer\'s Rise POI:', { id, x, y, poiType, icon, value });
              }

              // Determine icon based on dynamic data or fallback to poiType
              let iconFile = icon || POI_TYPE_ICON_MAP[poiType] || POI_TYPE_ICON_MAP.Default;
              
              // Special case for POI 149 (Major Location with Ruins)
              if (id === 149 && poiType === "Major_Locations") {
                iconFile = "Ruins.png";
              }
              
              // Special case for POI 131 (Minor Location that should be Church in crater)
              if (id === 131 && poiType === "Minor_Locations" && effectiveMapLayout === "the_crater_shifted") {
                iconFile = "Church.png";
              }
              
              // Special case for POI 91 (Flying Dragon only in crater layouts)
              if (id === 91 && effectiveMapLayout === "the_crater_shifted") {
                iconFile = "Field_Boss.png";
              }
              
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

              // Special handling for POI 159 (central castle) - show text instead of icon
              if (id === 159) {
                const castleEnemyType = dynamicPOIData?.castleEnemyType;
                if (!castleEnemyType) return null; // Don't render if no enemy type data

                const leftBound = 507;
                const activeWidth = 1690;
                const scaledX = ((x - leftBound) / activeWidth) * mapWidth;
                const scaledY = (y / 1690) * mapHeight;

                return (
                  <React.Fragment key={id}>
                    {showIcons && (
                      <KonvaText
                        text={formatBossName(castleEnemyType)}
                        x={scaledX}
                        y={scaledY}
                        fontSize={21}
                        fontFamily="Arial"
                        fill="#000000"
                        align="center"
                        listening={false}
                        fontStyle="bold"
                        offsetX={0}
                        offsetY={0}
                        shadowColor="#FFFFFF"
                        shadowBlur={8}
                        shadowOpacity={1}
                        shadowOffset={{ x: 0, y: 0 }}
                        stroke="#FFFFFF"
                        strokeWidth={0.05}
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
                          fill="rgba(255,255,255,0.7)"
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
              }

              // Overlay boss name on Evergaol and Field Boss icons using precomputed positions
              const titlePlacement = titlePlacements.find(t => t.id === id);

              return (
                <React.Fragment key={id}>
                  {showIcons && img && (
                    <>
                      <KonvaImage
                        image={img}
                        x={scaledX - displayWidth / 2}
                        y={scaledY - displayHeight / 2}
                        width={displayWidth}
                        height={displayHeight}
                      />
                      {showTitles && titlePlacement && (
                        <TextOverlay
                          text={titlePlacement.text}
                          x={titlePlacement.x}
                          y={titlePlacement.y}
                          priority={titlePlacement.priority}
                          id={String(id)}
                        />
                      )}
                    </>
                  )}
                  {showNumbers && (
                    <>
                      <KonvaImage
                        image={undefined}
                        x={scaledX - 24}
                        y={scaledY - 16}
                        width={48}
                        height={32}
                        fill="rgba(255,255,255,0.7)"
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