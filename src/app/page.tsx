"use client";
import { useState, useEffect } from "react";
import { Header } from "./_components/Header";
import { Sidebar } from "./_components/Sidebar";
import dynamic from "next/dynamic";

const MainPanel = dynamic(() => import("./_components/MainPanel").then(mod => mod.MainPanel), { ssr: false });

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mapLayout, setMapLayout] = useState("default");

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
              <Sidebar isOpen={showSidebar} onClose={() => setSidebarOpen(false)} mapLayout={mapLayout} onMapLayoutChange={setMapLayout} />
            </div>
            {/* 8px gap between objectives and map */}
            <div style={{ width: 8 }} />
            {/* Map panel, no border */}
            <div className="h-full flex-1 flex flex-col w-full sm:w-3/4 min-h-0">
              <MainPanel mapLayout={mapLayout} />
            </div>
          </>
        ) : (
          // Mobile: map canvas fills width, objectives overlays as before
          <div className="h-full flex-1 flex flex-col w-full min-h-0">
            <MainPanel mapLayout={mapLayout} />
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
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} mapLayout={mapLayout} onMapLayoutChange={setMapLayout} />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
