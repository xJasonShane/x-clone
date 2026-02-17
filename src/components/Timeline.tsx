'use client';

import { useEffect, useState } from 'react';
import { TweetCard } from './TweetCard';
import { ComposeTweet } from './ComposeTweet';
import { TweetSkeleton } from './Skeleton';
import { TweetWithAuthor } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function Timeline() {
  const { t, language } = useLanguage();
  const [tweets, setTweets] = useState<TweetWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');

  const fetchTweets = async () => {
    try {
      const res = await fetch('/api/tweets');
      const data = await res.json();
      if (data.success) {
        setTweets(data.data);
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  const handleTweetDelete = (id: string) => {
    setTweets(prev => prev.filter(tweet => tweet.id !== id));
  };

  const handleTweetUpdate = (id: string, updates: Partial<TweetWithAuthor>) => {
    setTweets(prev =>
      prev.map(tweet =>
        tweet.id === id ? { ...tweet, ...updates } : tweet
      )
    );
  };

  return (
    <div className="bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md">
        <div className="flex">
          <button
            onClick={() => setActiveTab('for-you')}
            className={cn(
              'flex-1 py-4 text-center text-[15px] font-medium transition-colors relative',
              activeTab === 'for-you' ? '' : 'text-[rgb(113,118,123)] hover:bg-white/[0.03]'
            )}
          >
            {language === 'zh' ? '推荐' : 'For you'}
            {activeTab === 'for-you' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={cn(
              'flex-1 py-4 text-center text-[15px] font-medium transition-colors relative',
              activeTab === 'following' ? '' : 'text-[rgb(113,118,123)] hover:bg-white/[0.03]'
            )}
          >
            {language === 'zh' ? '关注' : 'Following'}
            {activeTab === 'following' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Compose Tweet */}
      <ComposeTweet onSuccess={fetchTweets} />

      {/* Tweets */}
      {isLoading ? (
        <TweetSkeleton count={5} />
      ) : tweets.length === 0 ? (
        <div className="text-center py-16 px-8">
          <p className="text-[31px] font-bold mb-2">{t.tweet.noTweets}</p>
          <p className="text-[15px] text-[rgb(113,118,123)]">
            {language === 'zh' 
              ? '发布你的第一条推文，开始你的旅程吧！' 
              : 'Post your first tweet to get started!'}
          </p>
        </div>
      ) : (
        <div>
          {tweets.map(tweet => (
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
  );
}
