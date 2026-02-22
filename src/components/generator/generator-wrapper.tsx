'use client';

import { useState } from 'react';
import GeneratorHeader from './generator-header';
import GeneratorSidebar from './sidebar/generator-sidebar';
import RightSidebar from './sidebar/chat-history-sidebar';

export default function GeneratorWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const toggleRightSidebar = () => setRightSidebarOpen((prev) => !prev);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <GeneratorHeader
        toggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        toggleRightSidebar={toggleRightSidebar}
      />

      <div className="isolate relative grid lg:grid-cols-[auto_1fr_auto] dark:bg-dark-secondary flex-[1_1_0]">
        <GeneratorSidebar sidebarOpen={sidebarOpen} />

        {children}

        <RightSidebar
          isOpen={rightSidebarOpen}
          toggleIsOpen={toggleRightSidebar}
        />

        {/* Overlays */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-gray-800/80 backdrop-blur-lg transition-opacity"
            aria-hidden="true"
            onClick={toggleSidebar}
          />
        )}

        {rightSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-800/80 backdrop-blur-lg transition-opacity xl:hidden"
            aria-hidden="true"
            onClick={toggleRightSidebar}
          />
        )}
      </div>
    </div>
  );
}
