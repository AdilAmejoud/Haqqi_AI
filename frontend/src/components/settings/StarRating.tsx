import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating() {
  const [rating, setRating] = useState(5);

  return (
    <div className="flex items-center justify-between px-5 py-4 hover:bg-[#F7F8FA] transition-colors cursor-pointer">
      <div className="text-right">
        <p className="font-bold text-[#1F2937] text-sm">تقييم التطبيق</p>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            className={`${star <= rating ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-[#E5E7EB]'}`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
    </div>
  );
}
