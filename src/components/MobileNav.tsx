'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Search, Bell, Mail, User } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Explore', href: '/explore' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: Mail, label: 'Messages', href: '/messages' },
    { icon: User, label: 'Profile', href: `/user/${user?.username || 'me'}` },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 xl:hidden bg-black border-t border-[rgb(47,51,54)]">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-4 min-w-[64px]',
                isActive ? 'text-white' : 'text-[rgb(113,118,123)]'
              )}
            >
              <item.icon 
                className={cn(
                  "w-6 h-6",
                  isActive && "w-7 h-7"
                )} 
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
