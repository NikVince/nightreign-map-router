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
    <div className="min-h-screen bg-[var(--elden-background)] text-[var(--elden-text)] flex flex-col">
      <Header onOpenObjectives={() => setSidebarOpen(true)} />
      <div className="flex-1 w-full max-w-screen-2xl mx-auto px-0 sm:px-4 flex flex-col sm:flex-row gap-0 sm:gap-4 relative">
        <Sidebar
          isOpen={showSidebar}
          onClose={() => setSidebarOpen(false)}
        />
        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && !isDesktop && (
          <div
            className="fixed inset-0 bg-black/40 z-30 sm:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close overlay"
          />
        )}
        <div className="flex-1 flex flex-col">
          <MainPanel />
        </div>
      </div>
    </div>
  );
}
