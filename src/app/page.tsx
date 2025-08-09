"use client";
import { useState, useEffect } from "react";
import { Header } from "./_components/Header";
import { Sidebar } from "./_components/Sidebar";
import { type TeamMember } from "./_components/TeamComposition";
import { NightfarerClassType } from "~/types/core";
import type { RouteState, POIPriority, CompleteRoute } from "~/types/route";
import dynamic from "next/dynamic";

const MainPanel = dynamic(() => import("./_components/MainPanel").then(mod => mod.MainPanel), { ssr: false });

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [layoutNumber, setLayoutNumber] = useState(1);

  // Team composition state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 1, nightfarer: NightfarerClassType.Wylder, startsWithStoneswordKey: false }
  ]);

  // Icon category toggles
  const [iconToggles, setIconToggles] = useState({
    sitesOfGrace: false,
    spiritStreams: false,
    spiritHawkTrees: false,
    scarabs: false,
    buriedTreasures: false,
  });

  // Route state
  const [routeState, setRouteState] = useState<RouteState | null>(null);
  const [priorityCalculations, setPriorityCalculations] = useState<POIPriority[]>([]);
  const [completeRoute, setCompleteRoute] = useState<CompleteRoute | null>(null);
  const [debugPriorities, setDebugPriorities] = useState<POIPriority[]>([]);
  const [debugRoute, setDebugRoute] = useState<number[]>([]);
  const [debugDay1Route, setDebugDay1Route] = useState<number[]>([]);
  const [debugDay2Route, setDebugDay2Route] = useState<number[]>([]);

  const handleToggleChange = (key: string, value: boolean) => {
    setIconToggles(toggles => ({ ...toggles, [key]: value }));
  };

  useEffect(() => {
    // Set isDesktop based on window width
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 640);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Sidebar is open if desktop or manually opened on mobile
  const showSidebar = isDesktop || sidebarOpen;

  return (
    <div className="w-screen bg-[var(--elden-background)] text-[var(--elden-text)] flex flex-col overflow-hidden" style={{ height: '100dvh', minHeight: '100vh' }}>
              <Header onOpenObjectives={() => setSidebarOpen(true)} />
      <div style={{ height: 8 }} />
      <div
        className="flex flex-row min-h-0 w-full"
        style={
          isDesktop
            ? { marginTop: 72, height: 'calc(100dvh - 72px)' }
            : {
                position: 'fixed',
                top: 72,
                left: 0,
                width: '100vw',
                height: 'calc(100dvh - 72px)',
                zIndex: 10,
              }
        }
      >
        {isDesktop ? (
          <>
            {/* Objectives pane, no border */}
            <div className="h-full w-1/4 min-w-[220px] max-w-[400px] flex flex-col">
              <Sidebar
                isOpen={showSidebar}
                onClose={() => setSidebarOpen(false)}
                layoutNumber={layoutNumber}
                onLayoutChange={setLayoutNumber}
                onTeamChange={setTeamMembers}
                routeState={routeState}
                setRouteState={setRouteState}
                priorityCalculations={priorityCalculations}
                setPriorityCalculations={setPriorityCalculations}
                completeRoute={completeRoute}
                setCompleteRoute={setCompleteRoute}
                setDebugRoute={setDebugRoute}
                setDebugDay1Route={setDebugDay1Route}
                setDebugDay2Route={setDebugDay2Route}
              />
            </div>
            {/* 8px gap between objectives and map */}
            <div style={{ width: 8 }} />
            {/* Map panel, no border */}
            <div className="h-full flex-1 flex flex-col w-full sm:w-3/4 min-h-0">
              <MainPanel
                iconToggles={iconToggles}
                onLayoutChange={setLayoutNumber}
                onIconToggleChange={handleToggleChange}
                layoutNumber={layoutNumber}
                routeState={routeState}
                priorityCalculations={priorityCalculations}
                completeRoute={completeRoute}
                debugPriorities={debugPriorities}
                setDebugPriorities={setDebugPriorities}
                teamMembers={teamMembers}
                debugRoute={debugRoute}
                setDebugRoute={setDebugRoute}
                debugDay1Route={debugDay1Route}
                setDebugDay1Route={setDebugDay1Route}
                debugDay2Route={debugDay2Route}
                setDebugDay2Route={setDebugDay2Route}
              />
            </div>
          </>
        ) : (
          // Mobile: map canvas fills width, objectives overlays as before
          <div className="h-full flex-1 flex flex-col w-full min-h-0">
            <MainPanel
              iconToggles={iconToggles}
              onLayoutChange={setLayoutNumber}
              onIconToggleChange={handleToggleChange}
              layoutNumber={layoutNumber}
              routeState={routeState}
              priorityCalculations={priorityCalculations}
              completeRoute={completeRoute}
              debugPriorities={debugPriorities}
              setDebugPriorities={setDebugPriorities}
              teamMembers={teamMembers}
              debugRoute={debugRoute}
              setDebugRoute={setDebugRoute}
              debugDay1Route={debugDay1Route}
              setDebugDay1Route={setDebugDay1Route}
              debugDay2Route={debugDay2Route}
              setDebugDay2Route={setDebugDay2Route}
            />
            {sidebarOpen && (
              <>
                {/* Overlay for closing */}
                <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setSidebarOpen(false)} aria-label="Close overlay" />
                {/* Sidebar below header+gap */}
                <div
                  className="fixed left-0 z-50 w-[85vw] max-w-none flex flex-col border border-[var(--elden-primary)]"
                  style={{
                    top: 72,
                    height: 'calc(100dvh - 72px)',
                    background: 'var(--elden-panel-bg)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    layoutNumber={layoutNumber}
                    onLayoutChange={setLayoutNumber}
                    onTeamChange={setTeamMembers}
                    routeState={routeState}
                    setRouteState={setRouteState}
                    priorityCalculations={priorityCalculations}
                    setPriorityCalculations={setPriorityCalculations}
                    completeRoute={completeRoute}
                    setCompleteRoute={setCompleteRoute}
                    setDebugRoute={setDebugRoute}
                    setDebugDay1Route={setDebugDay1Route}
                    setDebugDay2Route={setDebugDay2Route}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
