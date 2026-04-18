import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  Library,
  ClipboardList,
  Settings,
  FileText,
  Scale,
  ChevronRight,
  ChevronLeft,
  Users
} from 'lucide-react';
import { Profile } from '../types';
import LogoutButton from './LogoutButton';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  profile: Profile | null;
}

const NAV_ITEMS = [
  { path: '/dashboard',  label: 'الرئيسية',     icon: Home },
  { path: '/chat',       label: 'المحادثات',    icon: MessageSquare },
  { path: '/library',    label: 'المكتبة',      icon: Library },
  { path: '/document',   label: 'المستندات',    icon: FileText },
  { path: '/procedures', label: 'المساطر الإدارية', icon: ClipboardList },
  { path: '/community',  label: 'منتدى المجتمع', icon: Users },
  { path: '/settings',   label: 'الإعدادات',    icon: Settings },
];

export default function Sidebar({ isOpen, setIsOpen, profile }: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed top-0 right-0 h-full bg-white border-l border-[#E5E7EB] z-50 transition-all duration-[280ms] ease-in-out flex flex-col ${isOpen ? 'w-64' : 'w-0 border-l-0'}`}>

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-[#E5E7EB] rounded-full shadow-sm flex items-center justify-center z-[60] transition-all ${isOpen ? '-left-4' : 'fixed right-0'}`}
        >
          {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={`w-64 h-full flex flex-col overflow-hidden ${!isOpen && 'opacity-0'}`}>
          {/* Logo Area */}
          <div className="p-6 flex items-center gap-2 border-b border-[#F3F4F6]">
            <Scale size={24} className="text-[#1B3A6B]" strokeWidth={1.5} />
            <span className="font-bold text-[#1B3A6B] text-xl">حقي</span>
            <span className="text-[#C9A84C] font-bold text-xl">AI</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive
                    ? 'bg-[#1B3A6B] text-white shadow-md'
                    : 'text-[#6B7280] hover:bg-[#E8EEF7] hover:text-[#1B3A6B]'}
                `}
              >
                <item.icon size={20} strokeWidth={1.5} />
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-[#F3F4F6] bg-white">
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
