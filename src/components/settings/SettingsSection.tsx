import React, { ReactNode } from 'react';

interface SettingsSectionProps {
  title: string;
  icon: any;
  children: ReactNode;
}

export default function SettingsSection({ title, icon: Icon, children }: SettingsSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Icon size={18} className="text-[#C9A84C]" strokeWidth={2} />
        <h2 className="font-bold text-[#1B3A6B] text-sm uppercase tracking-wider">{title}</h2>
      </div>
      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm">
        {children}
      </div>
    </div>
  );
}
