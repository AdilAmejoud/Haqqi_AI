import React from 'react';

interface SelectSettingProps {
  label: string;
  value: string;
  options?: string[];
}

export default function SelectSetting({ label, value }: SelectSettingProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6] last:border-0 hover:bg-[#F7F8FA] transition-colors cursor-pointer">
      <div className="text-right">
        <p className="font-bold text-[#1F2937] text-sm">{label}</p>
        <p className="text-xs text-[#6B7280]">{value}</p>
      </div>
      <button className="text-xs font-bold text-[#C9A84C] hover:underline transition-all">تغيير</button>
    </div>
  );
}
