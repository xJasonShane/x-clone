'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

export function RightSidebar() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const trendingTopics = [
    { category: 'Technology', tag: 'Technology', posts: 12500 },
    { category: 'Technology', tag: 'AI', posts: 8920 },
    { category: 'Technology', tag: 'Next.js', posts: 5670 },
    { category: 'Technology', tag: 'React', posts: 4320 },
    { category: 'Technology', tag: 'TypeScript', posts: 3180 },
  ];

  const suggestedUsers = [
    { name: 'Vercel', handle: 'vercel' },
    { name: 'Next.js', handle: 'nextjs' },
    { name: 'React', handle: 'reactjs' },
  ];

  return (
    <aside className="w-[350px] h-screen sticky top-0 flex flex-col gap-4 overflow-y-auto hidden lg:flex">
      {/* Search */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pt-2 pb-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t.rightSidebar.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-[42px] bg-muted/50 border-none rounded-full focus:bg-background focus:ring-1"
          />
        </div>
      </div>

      {/* Trending */}
      <div className="rounded-2xl border border-border/50 overflow-hidden bg-card">
        <h2 className="px-4 py-3 text-xl font-bold">{t.rightSidebar.trending}</h2>
        <div className="divide-y divide-border/50">
          {trendingTopics.map((topic, idx) => (
            <button
              key={idx}
              className="w-full px-4 py-3 text-left hover:bg-accent/30 transition-colors"
            >
              <p className="text-xs text-muted-foreground">{t.rightSidebar.trending} · {topic.category}</p>
              <p className="font-bold">#{topic.tag}</p>
              <p className="text-xs text-muted-foreground">{topic.posts.toLocaleString()} {language === 'zh' ? '帖子' : 'posts'}</p>
            </button>
          ))}
        </div>
        <button className="w-full px-4 py-3 text-left text-primary hover:bg-accent/30 transition-colors">
          {t.rightSidebar.showMore}
        </button>
      </div>

      {/* Who to follow */}
      <div className="rounded-2xl border border-border/50 overflow-hidden bg-card">
        <h2 className="px-4 py-3 text-xl font-bold">{t.rightSidebar.whoToFollow}</h2>
        <div className="divide-y divide-border/50">
          {suggestedUsers.map((user, idx) => (
            <div key={idx} className="px-4 py-3 hover:bg-accent/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user.handle}</p>
                </div>
                <button className="px-4 py-1.5 rounded-full bg-foreground text-background font-bold text-xs hover:opacity-80 transition-opacity">
                  {t.rightSidebar.follow}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full px-4 py-3 text-left text-primary hover:bg-accent/30 transition-colors">
          {t.rightSidebar.showMore}
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
        <a href="#" className="hover:underline">{language === 'zh' ? '服务条款' : 'Terms of Service'}</a>
        <a href="#" className="hover:underline">{language === 'zh' ? '隐私政策' : 'Privacy Policy'}</a>
        <a href="#" className="hover:underline">{language === 'zh' ? 'Cookie 政策' : 'Cookie Policy'}</a>
        <a href="#" className="hover:underline">{language === 'zh' ? '无障碍' : 'Accessibility'}</a>
        <a href="#" className="hover:underline">{language === 'zh' ? '广告信息' : 'Ads info'}</a>
        <span>© {new Date().getFullYear()} X Clone</span>
      </div>
    </aside>
  );
}
