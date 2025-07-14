"use client";
import { useState, useEffect, useRef } from "react";
import { Header } from "./_components/Header";
import { Sidebar } from "./_components/Sidebar";
import dynamic from "next/dynamic";

const MainPanel = dynamic(() => import("./_components/MainPanel").then(mod => mod.MainPanel), { ssr: false });

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mapLayout, setMapLayout] = useState("default");
  const headerRef = useRef<HTMLDivElement>(null);
  const [mobileContentHeight, setMobileContentHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Set isDesktop based on window width
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 640);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    function updateMobileContentHeight() {
      const isMobile = window.innerWidth < 640;
      if (isMobile && headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        setMobileContentHeight(window.innerHeight - headerHeight);
      } else {
        setMobileContentHeight(undefined);
      }
    }
    updateMobileContentHeight();
    window.addEventListener('resize', updateMobileContentHeight);
    window.addEventListener('orientationchange', updateMobileContentHeight);
    return () => {
      window.removeEventListener('resize', updateMobileContentHeight);
      window.removeEventListener('orientationchange', updateMobileContentHeight);
    };
  }, []);

  // Sidebar is open if desktop or manually opened on mobile
  const showSidebar = isDesktop || sidebarOpen;

  return (
    <div className="w-screen bg-[var(--elden-background)] text-[var(--elden-text)] flex flex-col overflow-hidden" style={{ height: '100dvh', minHeight: '100vh' }}>
      <div ref={headerRef}>
        <Header onOpenObjectives={() => setSidebarOpen(true)} />
      </div>
      {/* Main content: objectives + gap + map (desktop), map only (mobile) */}
      <div
        className="flex flex-row flex-1 min-h-0 w-full"
        style={isDesktop
          ? { marginTop: 80, height: 'calc(100dvh - 80px)' }
          : mobileContentHeight !== undefined
            ? { marginTop: 0, height: mobileContentHeight }
            : { marginTop: 80, height: 'calc(100dvh - 80px)' }
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
              <div className="fixed inset-0 z-50 flex bg-black/40">
                <div className="h-full w-[85vw] max-w-none flex flex-col bg-white/80 backdrop-blur">
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} mapLayout={mapLayout} onMapLayoutChange={setMapLayout} />
                </div>
                <div className="flex-1 h-full" onClick={() => setSidebarOpen(false)} aria-label="Close overlay" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
