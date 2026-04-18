import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface LogoutButtonProps {
  variant?: 'full' | 'icon';
}

export default function LogoutButton({ variant = 'full' }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    navigate('/');
    setLoading(false);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleSignOut}
        disabled={loading}
        aria-label="تسجيل الخروج"
        className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
      </button>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="flex items-center justify-end gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
    >
      <span>تسجيل الخروج</span>
      {loading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
    </button>
  );
}
