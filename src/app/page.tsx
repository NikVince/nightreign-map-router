"use client";
import { useState, useEffect } from "react";
import { Header } from "./_components/Header";
import { Sidebar } from "./_components/Sidebar";
import dynamic from "next/dynamic";

const MainPanel = dynamic(() => import("./_components/MainPanel").then(mod => mod.MainPanel), { ssr: false });

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

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
    <div className="h-screen w-screen overflow-hidden bg-[var(--elden-background)] text-[var(--elden-text)] flex flex-col">
      <Header onOpenObjectives={() => setSidebarOpen(true)} />
      <div className="flex-1 flex flex-row gap-x-4 pb-0">
        {/* Sidebar: 25% width on desktop, hidden on mobile unless open */}
        <div className="h-full w-1/4 min-w-[220px] max-w-[400px] flex flex-col">
          <Sidebar isOpen={showSidebar} onClose={() => setSidebarOpen(false)} />
        </div>
        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && !isDesktop && (
          <div
            className="fixed inset-0 bg-black/40 z-30 sm:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close overlay"
          />
        )}
        {/* MainPanel: 75% width on desktop, 100% on mobile */}
        <div className="h-full flex-1 flex flex-col">
          <MainPanel />
        </div>
      </div>
    </div>
  );
}
