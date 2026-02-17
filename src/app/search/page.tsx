'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { RightSidebar } from '@/components/RightSidebar';
import { TweetCard } from '@/components/TweetCard';
import { TweetSkeleton } from '@/components/Skeleton';
import { MobileNav } from '@/components/MobileNav';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, ArrowLeft, X } from 'lucide-react';
import { TweetWithAuthor } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar: string | null;
  bio: string | null;
  followers_count: number;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const initialQuery = searchParams.get('q') || '';
  const activeTab = searchParams.get('tab') || 'top';

  const [query, setQuery] = useState(initialQuery);
  const [tweets, setTweets] = useState<TweetWithAuthor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, activeTab]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      // Search tweets
      const tweetsRes = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=tweets`);
      const tweetsData = await tweetsRes.json();
      
      // Search users
      const usersRes = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=users`);
      const usersData = await usersRes.json();

      if (tweetsData.success) {
        setTweets(tweetsData.data.tweets);
      }
      if (usersData.success) {
        setUsers(usersData.data.users);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query.trim());
    }
  };

  const clearSearch = () => {
    setQuery('');
    setTweets([]);
    setUsers([]);
    setHasSearched(false);
  };

  const handleTweetDelete = (id: string) => {
    setTweets(prev => prev.filter(t => t.id !== id));
  };

  const handleTweetUpdate = (id: string, updates: Partial<TweetWithAuthor>) => {
    setTweets(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const tabs = [
    { id: 'top', label: language === 'zh' ? '热门' : 'Top' },
    { id: 'latest', label: language === 'zh' ? '最新' : 'Latest' },
    { id: 'people', label: language === 'zh' ? '用户' : 'People' },
    { id: 'media', label: language === 'zh' ? '媒体' : 'Media' },
  ];

  return (
    <>
      {/* Header with search */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-2 px-4 py-2">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/[0.1] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <form onSubmit={handleSubmit} className="flex-1">
            <div className="relative">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={language === 'zh' ? '搜索' : 'Search'}
                className="w-full h-[42px] bg-[rgb(32,35,39)] border-none rounded-full pl-4 pr-10 text-[15px] focus:ring-1 focus:ring-primary"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-primary text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabs */}
        {hasSearched && (
          <div className="flex overflow-x-auto scrollbar-hide border-b border-[rgb(47,51,54)]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('q', query);
                  params.set('tab', tab.id);
                  router.push(`/search?${params.toString()}`);
                }}
                className={cn(
                  'flex-1 min-w-[80px] py-4 text-center text-[15px] font-medium transition-colors relative whitespace-nowrap',
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
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <TweetSkeleton count={5} />
      ) : !hasSearched ? (
        <div className="py-8 px-4">
          <h2 className="text-[31px] font-bold mb-4">
            {language === 'zh' ? '搜索 X' : 'Search X'}
          </h2>
          <p className="text-[rgb(113,118,123)] text-[15px]">
            {language === 'zh' 
              ? '搜索用户、话题和推文' 
              : 'Search for people, topics, and posts'}
          </p>
        </div>
      ) : (
        <div>
          {/* Users section (show for all tabs, but prioritize based on tab) */}
          {activeTab === 'people' && users.length > 0 && (
            <div className="divide-y divide-[rgb(47,51,54)]">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/user/${user.username}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.display_name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[15px] truncate">{user.display_name}</p>
                    <p className="text-[13px] text-[rgb(113,118,123)] truncate">
                      @{user.username}
                    </p>
                    {user.bio && (
                      <p className="text-[13px] text-[rgb(113,118,123)] line-clamp-2 mt-1">
                        {user.bio}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full text-[13px] font-bold px-4 h-[32px] border-[rgb(83,100,113)] hover:bg-white/[0.1]"
                  >
                    {language === 'zh' ? '关注' : 'Follow'}
                  </Button>
                </Link>
              ))}
            </div>
          )}

          {/* Tweets section */}
          {(activeTab === 'top' || activeTab === 'latest' || activeTab === 'media') && (
            <>
              {tweets.length === 0 ? (
                <div className="text-center py-16 px-8">
                  <p className="text-[31px] font-bold mb-2">
                    {language === 'zh' ? '没有结果' : 'No results for'}
                  </p>
                  <p className="text-[rgb(113,118,123)]">
                    "{query}" {language === 'zh' ? '没有找到相关内容' : 'did not return any results'}
                  </p>
                </div>
              ) : (
                tweets.map((tweet) => (
                  <TweetCard
                    key={tweet.id}
                    tweet={tweet}
                    onDelete={handleTweetDelete}
                    onUpdate={handleTweetUpdate}
                  />
                ))
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-background pb-14 xl:pb-0">
      <div className="flex justify-center max-w-[1300px] mx-auto">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 min-w-0 max-w-[600px] border-x border-[rgb(47,51,54)] min-h-screen">
          <Suspense fallback={<TweetSkeleton count={5} />}>
            <SearchContent />
          </Suspense>
        </div>
        <RightSidebar />
      </div>
      <MobileNav />
    </main>
  );
}
