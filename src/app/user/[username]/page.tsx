'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { RightSidebar } from '@/components/RightSidebar';
import { MobileNav } from '@/components/MobileNav';
import { TweetCard } from '@/components/TweetCard';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, Loader2, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EditProfileModal } from '@/components/EditProfileModal';
import { TweetWithAuthor } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar: string | null;
  bio: string | null;
  cover_image: string | null;
  followers_count: number;
  following_count: number;
  created_at: string;
  verified?: boolean;
}

interface UserPageProps {
  params: Promise<{ username: string }>;
}

export default function UserPage({ params }: UserPageProps) {
  const router = useRouter();
  const { user: currentUser } = useUser();
  const { t, language } = useLanguage();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [tweets, setTweets] = useState<TweetWithAuthor[]>([]);
  const [activeTab, setActiveTab] = useState<'tweets' | 'replies' | 'highlights' | 'media' | 'likes'>('tweets');

  useEffect(() => {
    params.then(p => setUsername(p.username));
  }, [params]);

  useEffect(() => {
    if (username) {
      fetchUser();
      fetchUserTweets();
    }
  }, [username]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/users/${username}`);
      const data = await res.json();
      if (data.success) {
        setProfileUser(data.data.user);
        setIsFollowing(data.data.isFollowing);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserTweets = async () => {
    try {
      const res = await fetch(`/api/tweets?username=${username}`);
      const data = await res.json();
      if (data.success) {
        setTweets(data.data);
      }
    } catch (error) {
      console.error('Error fetching user tweets:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!profileUser) return;

    try {
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: profileUser.id }),
      });
      const data = await res.json();
      if (data.success) {
        setIsFollowing(data.following);
        setProfileUser(prev => prev ? {
          ...prev,
          followers_count: data.following 
            ? prev.followers_count + 1 
            : Math.max(0, prev.followers_count - 1),
        } : null);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

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

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const isOwnProfile = currentUser?.username === username;

  const tabs = [
    { id: 'tweets', label: t.profile.tweets },
    { id: 'replies', label: t.profile.replies },
    { id: 'highlights', label: language === 'zh' ? '精选' : 'Highlights' },
    { id: 'media', label: t.profile.media },
    { id: 'likes', label: t.profile.likes },
  ];

  return (
    <main className="min-h-screen bg-background pb-14 xl:pb-0">
      <div className="flex justify-center max-w-[1300px] mx-auto">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 min-w-0 max-w-[600px] border-x border-[rgb(47,51,54)] min-h-screen">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md">
            <div className="flex items-center gap-6 px-4 py-2">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-white/[0.1] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <h1 className="text-xl font-bold">{profileUser?.display_name}</h1>
                  {profileUser?.verified && (
                    <svg viewBox="0 0 22 22" className="w-5 h-5 fill-primary">
                      <path d="M20.396 11c-.018-.946-.082-1.856-.184-2.714a9.024 9.024 0 0 0-.712-2.472 6.865 6.865 0 0 0-1.358-2.027 6.865 6.865 0 0 0-2.027-1.358 9.024 9.024 0 0 0-2.472-.712A21.46 21.46 0 0 0 11 1.604c-.946.018-1.856.082-2.714.184a9.024 9.024 0 0 0-2.472.712 6.865 6.865 0 0 0-2.027 1.358 6.865 6.865 0 0 0-1.358 2.027 9.024 9.024 0 0 0-.712 2.472A21.46 21.46 0 0 0 1.604 11c.018.946.082 1.856.184 2.714a9.024 9.024 0 0 0 .712 2.472 6.865 6.865 0 0 0 1.358 2.027 6.865 6.865 0 0 0 2.027 1.358 9.024 9.024 0 0 0 2.472.712c.858.102 1.768.166 2.714.184.946-.018 1.856-.082 2.714-.184a9.024 9.024 0 0 0 2.472-.712 6.865 6.865 0 0 0 2.027-1.358 6.865 6.865 0 0 0 1.358-2.027 9.024 9.024 0 0 0 .712-2.472c.102-.858.166-1.768.184-2.714zM11 16.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
                    </svg>
                  )}
                </div>
                <p className="text-[13px] text-[rgb(113,118,123)]">
                  {tweets.length} {language === 'zh' ? '条推文' : 'posts'}
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !profileUser ? (
            <div className="text-center py-12 text-[rgb(113,118,123)]">
              <p>{t.user.notFound}</p>
            </div>
          ) : (
            <>
              {/* Cover Image */}
              <div className="h-52 bg-[rgb(33,37,42)] relative">
                {profileUser.cover_image && (
                  <img
                    src={profileUser.cover_image}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Profile Header */}
              <div className="px-4 pb-4">
                {/* Avatar and Action Buttons */}
                <div className="-mt-16 mb-3 flex justify-between items-end">
                  <Avatar className="w-28 h-28 md:w-32 md:h-32 border-4 border-black">
                    <AvatarImage src={profileUser.avatar || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-5xl">
                      {profileUser.display_name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mb-3 flex items-center gap-2">
                    {isOwnProfile ? (
                      <>
                        <Button
                          variant="outline"
                          className="rounded-full font-bold text-[15px] px-4 h-[32px] border-[rgb(83,100,113)] hover:bg-white/[0.1]"
                          onClick={() => setIsEditModalOpen(true)}
                        >
                          {t.profile.editProfile}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full border border-[rgb(83,100,113)] h-[32px] w-[32px]"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full border border-[rgb(83,100,113)] h-[32px] w-[32px]"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={isFollowing ? 'outline' : 'default'}
                          className={cn(
                            'rounded-full font-bold text-[15px] px-4 h-[32px]',
                            isFollowing 
                              ? 'border-[rgb(83,100,113)] hover:border-red-500 hover:bg-red-500/10 hover:text-red-500'
                              : 'bg-white text-black hover:bg-white/90'
                          )}
                          onClick={handleFollowToggle}
                        >
                          {isFollowing 
                            ? (language === 'zh' ? '正在关注' : 'Following')
                            : t.rightSidebar.follow
                          }
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <h2 className="text-xl font-bold">{profileUser.display_name}</h2>
                    {profileUser.verified && (
                      <svg viewBox="0 0 22 22" className="w-5 h-5 fill-primary">
                        <path d="M20.396 11c-.018-.946-.082-1.856-.184-2.714a9.024 9.024 0 0 0-.712-2.472 6.865 6.865 0 0 0-1.358-2.027 6.865 6.865 0 0 0-2.027-1.358 9.024 9.024 0 0 0-2.472-.712A21.46 21.46 0 0 0 11 1.604c-.946.018-1.856.082-2.714.184a9.024 9.024 0 0 0-2.472.712 6.865 6.865 0 0 0-2.027 1.358 6.865 6.865 0 0 0-1.358 2.027 9.024 9.024 0 0 0-.712 2.472A21.46 21.46 0 0 0 1.604 11c.018.946.082 1.856.184 2.714a9.024 9.024 0 0 0 .712 2.472 6.865 6.865 0 0 0 1.358 2.027 6.865 6.865 0 0 0 2.027 1.358 9.024 9.024 0 0 0 2.472.712c.858.102 1.768.166 2.714.184.946-.018 1.856-.082 2.714-.184a9.024 9.024 0 0 0 2.472-.712 6.865 6.865 0 0 0 2.027-1.358 6.865 6.865 0 0 0 1.358-2.027 9.024 9.024 0 0 0 .712-2.472c.102-.858.166-1.768.184-2.714zM11 16.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
                      </svg>
                    )}
                  </div>
                  <p className="text-[rgb(113,118,123)]">@{profileUser.username}</p>

                  {profileUser.bio && (
                    <p className="text-[15px] leading-[1.3125] pt-2">{profileUser.bio}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-[rgb(113,118,123)] pt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {t.profile.joined} {new Date(profileUser.created_at).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long' })}
                    </span>
                  </div>

                  <div className="flex gap-4 text-[15px] pt-2">
                    <Link href="#" className="hover:underline">
                      <span className="font-bold">{formatNumber(profileUser.following_count || 0)}</span>{' '}
                      <span className="text-[rgb(113,118,123)]">{t.profile.following}</span>
                    </Link>
                    <Link href="#" className="hover:underline">
                      <span className="font-bold">{formatNumber(profileUser.followers_count || 0)}</span>{' '}
                      <span className="text-[rgb(113,118,123)]">{t.profile.followers}</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex overflow-x-auto scrollbar-hide border-b border-[rgb(47,51,54)]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
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

              {/* Tweets */}
              {tweets.length === 0 ? (
                <div className="text-center py-16 px-8">
                  <p className="text-[31px] font-bold mb-2">{language === 'zh' ? '还没有推文' : 'No posts yet'}</p>
                  <p className="text-[15px] text-[rgb(113,118,123)]">
                    {language === 'zh' 
                      ? '发布的推文会显示在这里' 
                      : 'When they post, their posts will show up here'}
                  </p>
                </div>
              ) : (
                tweets.map(tweet => (
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
        <RightSidebar />
      </div>
      <EditProfileModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} />
      <MobileNav />
    </main>
  );
}
