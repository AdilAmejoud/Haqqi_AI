import React from 'react';

interface SelectSettingProps {
  label: string;
  value: string;
  options?: string[];
  onChange?: (value: string) => void;
}

export default function SelectSetting(props: SelectSettingProps) {
  const { label, value, options } = props;
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6] last:border-0 hover:bg-[#F7F8FA] transition-colors cursor-pointer relative">
      <div className="text-right">
        <p className="font-bold text-[#1F2937] text-sm">{label}</p>
        <p className="text-xs text-[#6B7280]">{value}</p>
      </div>
      {options && options.length > 0 ? (
        <select 
          value={value}
          onChange={props.onChange ? (e) => props.onChange!(e.target.value) : undefined}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : null}
      <button className="text-xs font-bold text-[#C9A84C] hover:underline transition-all relative z-10 pointer-events-none">تغيير</button>
    </div>
  );
}
