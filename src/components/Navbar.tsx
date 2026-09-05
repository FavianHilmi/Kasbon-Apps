'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';
import { LogOut, Wallet } from 'lucide-react';

interface NavbarProps {
  userEmail?: string;
}

export function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-sky-700">
      <div className="mx-auto flex max-w-5xl items-center justify-between p-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">
            Kasbon Apps
          </span>
        </div>

        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="hidden text-sm font-medium text-sky-200 sm:inline-block">
              {userEmail}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-slate-400 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-sky-800 hover:cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}