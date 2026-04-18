import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface ActionSettingProps {
  label: string;
  sub?: string;
  action?: string;
  icon?: any;
  onClick?: () => void;
  danger?: boolean;
}

export default function ActionSetting({ label, sub, action, icon: Icon, onClick, danger }: ActionSettingProps) {
  return (
    <div 
      className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6] last:border-0 hover:bg-[#F7F8FA] transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <div className="text-right">
        <p className={`font-bold text-sm ${danger ? 'text-red-500' : 'text-[#1F2937]'}`}>{label}</p>
        {sub && <p className="text-xs text-[#6B7280]">{sub}</p>}
      </div>
      <div className="flex items-center gap-2">
        {action && <span className="text-xs font-bold text-[#1B3A6B] bg-[#E8EEF7] px-2 py-1 rounded-md">{action}</span>}
        {Icon ? <Icon size={16} className="text-[#6B7280]" /> : <ChevronLeft size={16} className="text-[#E5E7EB] group-hover:text-[#1B3A6B] transition-colors" />}
      </div>
    </div>
  );
}
