import React, { useState } from 'react';

export default function FontSizeSetting() {
  const [size, setSize] = useState('medium');

  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#F3F4F6] last:border-0 hover:bg-[#F7F8FA] transition-colors">
      <div className="text-right">
        <p className="font-bold text-[#1F2937] text-sm">حجم الخط</p>
        <p className="text-xs text-[#6B7280]">تعديل حجم النصوص في التطبيق</p>
      </div>
      <div className="flex bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg p-1">
        {[
          { id: 'small',  label: 'صغير' },
          { id: 'medium', label: 'متوسط' },
          { id: 'large',  label: 'كبير' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setSize(item.id)}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              size === item.id 
                ? 'bg-[#1B3A6B] text-white shadow-sm' 
                : 'text-[#6B7280] hover:text-[#1B3A6B]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
