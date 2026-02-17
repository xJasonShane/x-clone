'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  User,
  MoreHorizontal,
  Settings,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  onEditProfile?: () => void;
}

export function Sidebar({ onEditProfile }: SidebarProps) {
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const { t, language } = useLanguage();

  const navItems = [
    { icon: Home, label: t.nav.home, href: '/' },
    { icon: Search, label: t.nav.explore, href: '/explore' },
    { icon: Bell, label: t.nav.notifications, href: '/notifications' },
    { icon: Mail, label: t.nav.messages, href: '/messages' },
    { icon: Bookmark, label: t.nav.bookmarks, href: '/bookmarks' },
    { icon: Users, label: language === 'zh' ? '社区' : 'Communities', href: '/communities' },
    { icon: User, label: t.nav.profile, href: '/profile' },
  ];

  return (
    <div className="flex flex-col h-screen w-[68px] xl:w-[275px] sticky top-0">
      {/* Logo */}
      <div className="py-2 px-2.5">
        <Link
          href="/"
          className="w-[52px] h-[52px] flex items-center justify-center rounded-full hover:bg-white/[0.1] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-[26px] h-[26px] fill-white">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href === '/profile' && pathname.startsWith('/user'));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-5 px-3 py-[10px] rounded-full transition-colors',
                'hover:bg-white/[0.1] font-bold text-[20px] w-[52px] xl:w-auto',
                isActive ? 'text-white' : 'text-white'
              )}
              title={item.label}
            >
              <item.icon 
                className={cn(
                  "w-[26px] h-[26px] flex-shrink-0",
                  isActive && "w-7 h-7"
                )} 
              />
              <span className="hidden xl:inline leading-tight">{item.label}</span>
            </Link>
          );
        })}
        
        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-5 px-3 py-[10px] rounded-full transition-colors hover:bg-white/[0.1] font-bold text-[20px] w-[52px] xl:w-auto text-white"
            >
              <MoreHorizontal className="w-[26px] h-[26px] flex-shrink-0" />
              <span className="hidden xl:inline leading-tight">{language === 'zh' ? '更多' : 'More'}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[260px] bg-[rgb(22,28,34)] border-[rgb(56,68,77)]">
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-4 text-[15px] py-3 px-4 hover:bg-white/[0.1]">
                <Settings className="w-5 h-5" />
                {t.nav.settings}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Post Button */}
      <div className="px-2.5 py-4">
        <Button className="w-[52px] h-[52px] xl:w-full xl:h-[52px] rounded-full text-[17px] font-bold bg-[rgb(29,155,240)] hover:bg-[rgb(26,140,216)] p-0 xl:px-4">
          <span className="hidden xl:inline">{t.tweet.post}</span>
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current xl:hidden">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </Button>
      </div>

      {/* User Profile */}
      <div className="px-2.5 pb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-3 rounded-full hover:bg-white/[0.1] transition-colors w-[52px] h-[52px] xl:w-full xl:h-auto">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={user?.avatar || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user?.display_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden xl:flex flex-1 text-left min-w-0">
                <div className="flex-1">
                  <p className="font-bold text-[15px] truncate text-white">
                    {isLoading ? '...' : user?.display_name || 'User'}
                  </p>
                  <p className="text-[15px] text-[rgb(113,118,123)] truncate">
                    @{user?.username || 'user'}
                  </p>
                </div>
              </div>
              <MoreHorizontal className="w-5 h-5 text-[rgb(113,118,123)] hidden xl:block flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[260px] bg-[rgb(22,28,34)] border-[rgb(56,68,77)]">
            <DropdownMenuLabel className="text-[15px] py-3">
              <div className="flex flex-col">
                <span className="font-bold text-white">{user?.display_name}</span>
                <span className="text-sm text-[rgb(113,118,123)]">@{user?.username}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[rgb(56,68,77)]" />
            <DropdownMenuItem 
              onClick={onEditProfile}
              className="text-[15px] py-3 px-4 hover:bg-white/[0.1]"
            >
              <User className="w-5 h-5 mr-3" />
              {t.profile.editProfile}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="text-[15px] py-3 px-4 hover:bg-white/[0.1]">
                <Settings className="w-5 h-5 mr-3" />
                {t.nav.settings}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[rgb(56,68,77)]" />
            <DropdownMenuItem className="text-[15px] py-3 px-4 hover:bg-white/[0.1] text-[rgb(244,33,46)]">
              {language === 'zh' ? '退出登录' : 'Log out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
