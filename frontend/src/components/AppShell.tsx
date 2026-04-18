import React, { useState, ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { Profile } from '../types';

interface AppShellProps {
  children: ReactNode;
  profile: Profile | null;
}

export default function AppShell({ children, profile }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="bg-[#F7F8FA] min-h-screen flex flex-col overflow-hidden" dir="rtl">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        profile={profile}
      />

      <div className={`flex flex-col h-screen transition-all duration-[280ms] ease-in-out ${isSidebarOpen ? 'mr-64' : 'mr-0'}`}>
        <TopNav
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          profile={profile}
        />

        <main className="flex-grow overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
