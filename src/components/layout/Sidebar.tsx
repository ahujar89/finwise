'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Lightbulb,
  Target,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#14532d] flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-green-800">
        <TrendingUp className="w-6 h-6 text-green-300" />
        <span className="text-xl font-bold text-white tracking-tight">FinWise</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-800 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-green-800">
        <p className="text-xs text-green-400">Data stored locally</p>
        <p className="text-xs text-green-500 mt-0.5">No account needed</p>
      </div>
    </aside>
  );
}
