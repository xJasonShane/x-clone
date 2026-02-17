'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { RightSidebar } from '@/components/RightSidebar';
import { TweetCard } from '@/components/TweetCard';
import { TweetSkeleton } from '@/components/Skeleton';
import { MobileNav } from '@/components/MobileNav';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bookmark } from 'lucide-react';
import { TweetWithAuthor } from '@/lib/types';

export default function BookmarksPage() {
  const { t, language } = useLanguage();
  const [bookmarks, setBookmarks] = useState<TweetWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/bookmarks');
      const data = await res.json();
      if (data.success) {
        setBookmarks(data.data);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTweetDelete = (id: string) => {
    setBookmarks(prev => prev.filter(tweet => tweet.id !== id));
  };

  const handleTweetUpdate = (id: string, updates: Partial<TweetWithAuthor>) => {
    setBookmarks(prev =>
      prev.map(tweet =>
        tweet.id === id ? { ...tweet, ...updates } : tweet
      )
    );
  };

  return (
    <main className="min-h-screen bg-background pb-14 xl:pb-0">
      <div className="flex justify-center max-w-[1300px] mx-auto">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 min-w-0 max-w-[600px] border-x border-[rgb(47,51,54)] min-h-screen">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md">
            <div className="px-4 py-3">
              <h1 className="text-xl font-bold">{t.bookmarks.title}</h1>
              <p className="text-[13px] text-[rgb(113,118,123)]">@you</p>
            </div>
          </div>

          {isLoading ? (
            <TweetSkeleton count={5} />
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-16 px-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[rgb(30,39,50)] flex items-center justify-center">
                <Bookmark className="w-8 h-8 text-[rgb(113,118,123)]" />
              </div>
              <h2 className="text-[31px] font-bold mb-2">{t.bookmarks.noBookmarks}</h2>
              <p className="text-[15px] text-[rgb(113,118,123)] max-w-[300px] mx-auto">
                {t.bookmarks.noBookmarksDesc}
              </p>
            </div>
          ) : (
            <div>
              {bookmarks.map(tweet => (
                <TweetCard
                  key={tweet.id}
                  tweet={tweet}
                  onDelete={handleTweetDelete}
                  onUpdate={handleTweetUpdate}
                />
              ))}
            </div>
          )}
        </div>
        <RightSidebar />
      </div>
      <MobileNav />
    </main>
  );
}
