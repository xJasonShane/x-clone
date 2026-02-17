'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { RightSidebar } from '@/components/RightSidebar';
import { MobileNav } from '@/components/MobileNav';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bell, Settings, User, Heart, Repeat2, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'like' | 'retweet' | 'mention' | 'follow';
  created_at: string;
  is_read: boolean;
  actor: {
    username: string;
    display_name: string;
    avatar: string | null;
  };
  tweet?: {
    id: string;
    content: string;
  };
}

export default function NotificationsPage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'mentions'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Mock notifications data
  useEffect(() => {
    setNotifications([
      {
        id: '1',
        type: 'like',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        is_read: false,
        actor: {
          username: 'nextjs',
          display_name: 'Next.js',
          avatar: null,
        },
        tweet: {
          id: 'tweet-1',
          content: 'Building a Twitter clone with Next.js is so much fun!',
        },
      },
      {
        id: '2',
        type: 'retweet',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        is_read: false,
        actor: {
          username: 'vercel',
          display_name: 'Vercel',
          avatar: null,
        },
        tweet: {
          id: 'tweet-2',
          content: 'Just deployed my first app on Vercel!',
        },
      },
      {
        id: '3',
        type: 'follow',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        is_read: true,
        actor: {
          username: 'reactjs',
          display_name: 'React',
          avatar: null,
        },
      },
      {
        id: '4',
        type: 'mention',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        is_read: true,
        actor: {
          username: 'typescript',
          display_name: 'TypeScript',
          avatar: null,
        },
        tweet: {
          id: 'tweet-3',
          content: '@you TypeScript makes everything better!',
        },
      },
    ]);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-8 h-8 text-[rgb(249,24,128)] fill-[rgb(249,24,128)]" />;
      case 'retweet':
        return <Repeat2 className="w-8 h-8 text-[rgb(0,186,124)]" />;
      case 'mention':
        return <AtSign className="w-8 h-8 text-primary" />;
      case 'follow':
        return <User className="w-8 h-8 text-primary" />;
      default:
        return <Bell className="w-8 h-8 text-[rgb(113,118,123)]" />;
    }
  };

  const filteredNotifications = activeTab === 'mentions' 
    ? notifications.filter(n => n.type === 'mention')
    : notifications;

  return (
    <main className="min-h-screen bg-background pb-14 xl:pb-0">
      <div className="flex justify-center max-w-[1300px] mx-auto">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 min-w-0 max-w-[600px] border-x border-[rgb(47,51,54)] min-h-screen">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md">
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className="text-xl font-bold">{t.notifications.title}</h1>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="w-5 h-5" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex">
              <button
                onClick={() => setActiveTab('all')}
                className={cn(
                  'flex-1 py-4 text-center text-[15px] font-medium transition-colors relative',
                  activeTab === 'all' ? '' : 'text-[rgb(113,118,123)] hover:bg-white/[0.03]'
                )}
              >
                {t.notifications.all}
                {activeTab === 'all' && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-primary" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('mentions')}
                className={cn(
                  'flex-1 py-4 text-center text-[15px] font-medium transition-colors relative',
                  activeTab === 'mentions' ? '' : 'text-[rgb(113,118,123)] hover:bg-white/[0.03]'
                )}
              >
                {t.notifications.mentions}
                {activeTab === 'mentions' && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-primary" />
                )}
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 px-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[rgb(30,39,50)] flex items-center justify-center">
                <Bell className="w-8 h-8 text-[rgb(113,118,123)]" />
              </div>
              <h2 className="text-[31px] font-bold mb-2">{t.notifications.noNotifications}</h2>
              <p className="text-[15px] text-[rgb(113,118,123)]">
                {language === 'zh' 
                  ? '当有人与你互动时，你会在这里看到' 
                  : 'When someone interacts with you, you\'ll see it here'}
              </p>
            </div>
          ) : (
            <div>
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex gap-3 px-4 py-3 border-b border-[rgb(47,51,54)] hover:bg-white/[0.03] transition-colors cursor-pointer',
                    !notification.is_read && 'bg-primary/5'
                  )}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 flex justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Avatar row */}
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {notification.actor.display_name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-[15px]">
                        {notification.actor.display_name}
                      </span>
                    </div>

                    {/* Message */}
                    <p className="text-[15px] text-[rgb(113,118,123)] mb-1">
                      {notification.type === 'like' && (language === 'zh' ? '喜欢了你的推文' : 'liked your post')}
                      {notification.type === 'retweet' && (language === 'zh' ? '转推了你的推文' : 'reposted your post')}
                      {notification.type === 'mention' && (language === 'zh' ? '提及了你' : 'mentioned you')}
                      {notification.type === 'follow' && (language === 'zh' ? '关注了你' : 'followed you')}
                    </p>

                    {/* Tweet preview */}
                    {notification.tweet && (
                      <p className="text-[15px] text-[rgb(113,118,123)] line-clamp-2">
                        {notification.tweet.content}
                      </p>
                    )}

                    {/* Follow button for follow notifications */}
                    {notification.type === 'follow' && (
                      <Button className="mt-2 rounded-full px-4 py-1.5 h-[32px] font-bold text-[15px]">
                        {t.rightSidebar.follow}
                      </Button>
                    )}
                  </div>
                </div>
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
