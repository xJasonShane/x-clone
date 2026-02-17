'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { RightSidebar } from '@/components/RightSidebar';
import { MobileNav } from '@/components/MobileNav';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Search, Settings, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Trend {
  id: string;
  category: string;
  name: string;
  tweets_count: number;
}

interface SuggestedUser {
  id: string;
  username: string;
  display_name: string;
  avatar: string | null;
  bio: string | null;
  verified?: boolean;
}

export default function ExplorePage() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'for-you' | 'trending' | 'news' | 'sports' | 'entertainment'>('for-you');

  const trends: Trend[] = [
    { id: '1', category: language === 'zh' ? '科技 · 趋势' : 'Technology · Trending', name: '#NextJS', tweets_count: 12500 },
    { id: '2', category: language === 'zh' ? '编程 · 趋势' : 'Programming · Trending', name: '#TypeScript', tweets_count: 8500 },
    { id: '3', category: language === 'zh' ? '前端 · 趋势' : 'Frontend · Trending', name: '#React', tweets_count: 15200 },
    { id: '4', category: language === 'zh' ? '科技 · 趋势' : 'Technology · Trending', name: '#AI', tweets_count: 45000 },
    { id: '5', category: language === 'zh' ? '开发 · 趋势' : 'Development · Trending', name: '#WebDev', tweets_count: 6800 },
  ];

  const suggestedUsers: SuggestedUser[] = [
    { id: '1', username: 'vercel', display_name: 'Vercel', avatar: null, bio: language === 'zh' ? '让前端开发更简单' : 'Make Frontend Simple', verified: true },
    { id: '2', username: 'nextjs', display_name: 'Next.js', avatar: null, bio: language === 'zh' ? 'React 框架' : 'The React Framework', verified: true },
    { id: '3', username: 'reactjs', display_name: 'React', avatar: null, bio: language === 'zh' ? '用于构建用户界面的 JavaScript 库' : 'A JavaScript library for building UIs', verified: true },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <main className="min-h-screen bg-background pb-14 xl:pb-0">
      <div className="flex justify-center max-w-[1300px] mx-auto">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 min-w-0 max-w-[600px] border-x border-[rgb(47,51,54)] min-h-screen">
          {/* Search Header */}
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md">
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(113,118,123)]" />
                <Input
                  type="text"
                  placeholder={t.search.placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-[42px] bg-[rgb(32,35,39)] border-none rounded-full focus:bg-black focus:ring-1 focus:ring-primary text-[15px]"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto scrollbar-hide">
              {[
                { id: 'for-you', label: language === 'zh' ? '推荐' : 'For you' },
                { id: 'trending', label: language === 'zh' ? '趋势' : 'Trending' },
                { id: 'news', label: language === 'zh' ? '新闻' : 'News' },
                { id: 'sports', label: language === 'zh' ? '体育' : 'Sports' },
                { id: 'entertainment', label: language === 'zh' ? '娱乐' : 'Entertainment' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    'flex-1 min-w-[100px] py-4 text-center text-[15px] font-medium transition-colors relative whitespace-nowrap',
                    activeTab === tab.id ? '' : 'text-[rgb(113,118,123)] hover:bg-white/[0.03]'
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Trends */}
          <div className="divide-y divide-[rgb(47,51,54)]">
            {trends.map((trend, index) => (
              <div
                key={trend.id}
                className="px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[13px] text-[rgb(113,118,123)]">
                      {trend.category}
                    </p>
                    <p className="font-bold text-[15px] mt-0.5">{trend.name}</p>
                    <p className="text-[13px] text-[rgb(113,118,123)] mt-0.5">
                      {formatNumber(trend.tweets_count)} {language === 'zh' ? '帖子' : 'posts'}
                    </p>
                  </div>
                  <button className="p-2 -m-2 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-[rgb(113,118,123)]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Show more */}
          <button className="w-full px-4 py-4 text-primary hover:bg-white/[0.03] transition-colors text-left">
            {t.rightSidebar.showMore}
          </button>

          {/* Suggested Users */}
          <div className="border-t border-[rgb(47,51,54)] mt-4">
            <div className="px-4 py-3">
              <h2 className="text-xl font-bold">{t.rightSidebar.whoToFollow}</h2>
            </div>
            <div className="divide-y divide-[rgb(47,51,54)]">
              {suggestedUsers.map((user) => (
                <div
                  key={user.id}
                  className="px-4 py-3 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Link href={`/user/${user.username}`}>
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {user.display_name[0]}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <Link 
                          href={`/user/${user.username}`}
                          className="font-bold text-[15px] hover:underline truncate"
                        >
                          {user.display_name}
                        </Link>
                        {user.verified && (
                          <svg viewBox="0 0 22 22" className="w-4 h-4 fill-primary">
                            <path d="M20.396 11c-.018-.946-.082-1.856-.184-2.714a9.024 9.024 0 0 0-.712-2.472 6.865 6.865 0 0 0-1.358-2.027 6.865 6.865 0 0 0-2.027-1.358 9.024 9.024 0 0 0-2.472-.712A21.46 21.46 0 0 0 11 1.604c-.946.018-1.856.082-2.714.184a9.024 9.024 0 0 0-2.472.712 6.865 6.865 0 0 0-2.027 1.358 6.865 6.865 0 0 0-1.358 2.027 9.024 9.024 0 0 0-.712 2.472A21.46 21.46 0 0 0 1.604 11c.018.946.082 1.856.184 2.714a9.024 9.024 0 0 0 .712 2.472 6.865 6.865 0 0 0 1.358 2.027 6.865 6.865 0 0 0 2.027 1.358 9.024 9.024 0 0 0 2.472.712c.858.102 1.768.166 2.714.184.946-.018 1.856-.082 2.714-.184a9.024 9.024 0 0 0 2.472-.712 6.865 6.865 0 0 0 2.027-1.358 6.865 6.865 0 0 0 1.358-2.027 9.024 9.024 0 0 0 .712-2.472c.102-.858.166-1.768.184-2.714zM11 16.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
                          </svg>
                        )}
                      </div>
                      <p className="text-[13px] text-[rgb(113,118,123)] truncate">
                        @{user.username}
                      </p>
                    </div>
                    <Button className="rounded-full px-4 py-1.5 h-[32px] font-bold text-[15px] bg-white text-black hover:bg-white/90">
                      {t.rightSidebar.follow}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full px-4 py-4 text-primary hover:bg-white/[0.03] transition-colors text-left">
              {t.rightSidebar.showMore}
            </button>
          </div>
        </div>
        <RightSidebar />
      </div>
      <MobileNav />
    </main>
  );
}
