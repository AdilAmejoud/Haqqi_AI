import React from 'react';
import { Menu, Bell, Search, Scale } from 'lucide-react';
import { Profile } from '../types';

interface TopNavProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  profile: Profile | null;
}

export default function TopNav({ isSidebarOpen, setIsSidebarOpen, profile }: TopNavProps) {
  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-[#F7F8FA] rounded-lg text-[#6B7280] lg:hidden"
          >
            <Menu size={22} />
          </button>
        )}

        {/* Mobile Logo */}
        <div className={`flex items-center gap-2 lg:hidden ${isSidebarOpen ? 'opacity-0' : 'opacity-100'}`}>
          <Scale size={22} className="text-[#1B3A6B]" />
          <span className="font-bold text-[#1B3A6B]">حقي</span>
        </div>
      </div>

      <div className="flex-1 max-w-xl px-4 hidden sm:block">
        <div className="relative group">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#1B3A6B]" />
          <input
            type="text"
            placeholder="ابحث في القوانين، العقود، أو المساطر..."
            className="w-full bg-[#F7F8FA] border border-transparent focus:border-[#1B3A6B] focus:bg-white rounded-xl py-2 pr-12 pl-4 text-sm transition-all outline-none"
            dir="rtl"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="p-2 text-[#6B7280] hover:bg-[#F7F8FA] rounded-lg relative">
          <Bell size={20} strokeWidth={1.5} />
          <span className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-[#E5E7EB] hidden sm:block"></div>

        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-[#E8EEF7] text-[#1B3A6B] font-bold text-sm hover:shadow-md transition-all">
          {profile?.full_name?.charAt(0) || 'U'}
        </button>
      </div>
    </header>
  );
}
