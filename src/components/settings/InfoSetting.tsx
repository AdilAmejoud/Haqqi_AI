import React from 'react';

interface InfoSettingProps {
  label: string;
  value: string;
  badge?: string;
}

export default function InfoSetting({ label, value, badge }: InfoSettingProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6] last:border-0 hover:bg-[#F7F8FA] transition-colors">
      <div className="text-right">
        <p className="font-bold text-[#1F2937] text-sm">{label}</p>
        <p className="text-xs text-[#6B7280]">{value}</p>
      </div>
      {badge && <span className="text-[10px] font-bold bg-[#DCFCE7] text-[#16A34A] px-2 py-0.5 rounded-full">{badge}</span>}
    </div>
  );
}
