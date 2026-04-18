import React, { useState } from 'react';

interface ToggleSettingProps {
  label: string;
  sub?: string;
  defaultOn?: boolean;
}

export default function ToggleSetting({ label, sub, defaultOn = false }: ToggleSettingProps) {
  const [isOn, setIsOn] = useState(defaultOn);

  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6] last:border-0 hover:bg-[#F7F8FA] transition-colors cursor-pointer" onClick={() => setIsOn(!isOn)}>
      <div className="text-right">
        <p className="font-bold text-[#1F2937] text-sm">{label}</p>
        {sub && <p className="text-xs text-[#6B7280]">{sub}</p>}
      </div>
      <div className={`w-11 h-6 rounded-full transition-colors relative ${isOn ? 'bg-[#1B3A6B]' : 'bg-[#E5E7EB]'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isOn ? 'right-6' : 'right-1'}`} />
      </div>
    </div>
  );
}
