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
      <div className="flex-1 flex flex-col sm:flex-row gap-x-4 pb-0">
        {/* Sidebar: overlay on mobile, sidebar on desktop */}
        {isDesktop ? (
          <div className="h-full w-1/4 min-w-[220px] max-w-[400px] flex flex-col">
            <Sidebar isOpen={showSidebar} onClose={() => setSidebarOpen(false)} />
          </div>
        ) : (
          sidebarOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div className="h-full w-[85vw] max-w-none flex flex-col">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
              </div>
              <div className="flex-1 h-full bg-black/40" onClick={() => setSidebarOpen(false)} aria-label="Close overlay" />
            </div>
          )
        )}
        {/* MainPanel: 100% width on mobile, 75% on desktop */}
        <div className="h-full flex-1 flex flex-col w-full sm:w-3/4">
          <MainPanel />
        </div>
      </div>
    </div>
  );
}
