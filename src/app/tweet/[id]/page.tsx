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
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TweetWithAuthor } from '@/lib/types';

interface TweetPageProps {
  params: Promise<{ id: string }>;
}

export default function TweetPage({ params }: TweetPageProps) {
  const router = useRouter();
  const { user } = useUser();
  const { t, language } = useLanguage();
  const [tweet, setTweet] = useState<TweetWithAuthor | null>(null);
  const [replies, setReplies] = useState<TweetWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [tweetId, setTweetId] = useState<string>('');

  useEffect(() => {
    params.then(p => setTweetId(p.id));
  }, [params]);

  useEffect(() => {
    if (tweetId) {
      fetchTweet();
    }
  }, [tweetId]);

  const fetchTweet = async () => {
    try {
      const res = await fetch(`/api/tweets/${tweetId}`);
      const data = await res.json();
      if (data.success) {
        setTweet(data.data.tweet);
        setReplies(data.data.replies);
      }
    } catch (error) {
      console.error('Error fetching tweet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostReply = async () => {
    if (!replyContent.trim() || isPosting) return;

    setIsPosting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent.trim(),
          parentId: tweetId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReplyContent('');
        fetchTweet();
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleReplyDelete = (id: string) => {
    setReplies(prev => prev.filter(r => r.id !== id));
    if (tweet) {
      setTweet({ ...tweet, comments_count: Math.max(0, tweet.comments_count - 1) });
    }
  };

  const handleReplyUpdate = (id: string, updates: Partial<TweetWithAuthor>) => {
    setReplies(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  return (
    <main className="min-h-screen bg-background pb-14 xl:pb-0">
      <div className="flex justify-center max-w-[1300px] mx-auto">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 min-w-0 max-w-[600px] border-x border-border/50 min-h-screen">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="flex items-center gap-6 px-4 py-2">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-accent/50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold">{t.tweetDetail.title}</h1>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !tweet ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t.tweetDetail.notFound}</p>
            </div>
          ) : (
            <>
              {/* Main Tweet */}
              <article className="p-4 border-b border-border/50">
                {/* Author */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={tweet.author.avatar || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {tweet.author.display_name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/user/${tweet.author.username}`}
                      className="font-bold hover:underline"
                    >
                      {tweet.author.display_name}
                    </Link>
                    <p className="text-muted-foreground text-sm">
                      @{tweet.author.username}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <p className="text-xl leading-relaxed whitespace-pre-wrap mb-4">
                  {tweet.content}
                </p>

                {/* Images */}
                {tweet.images && tweet.images.length > 0 && (
                  <div className="rounded-2xl overflow-hidden border border-border/50 mb-4">
                    {tweet.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Tweet image ${idx + 1}`}
                        className="w-full max-h-[500px] object-cover"
                      />
                    ))}
                  </div>
                )}

                {/* Time */}
                <p className="text-muted-foreground text-sm mb-4">
                  {new Date(tweet.created_at).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>

                {/* Stats */}
                <div className="flex gap-4 py-4 border-y border-border/50 text-sm">
                  <span>
                    <span className="font-bold">{tweet.retweets_count}</span>{' '}
                    <span className="text-muted-foreground">{t.tweet.retweet}</span>
                  </span>
                  <span>
                    <span className="font-bold">{tweet.quotes_count || 0}</span>{' '}
                    <span className="text-muted-foreground">{t.tweetDetail.quotes}</span>
                  </span>
                  <span>
                    <span className="font-bold">{tweet.likes_count}</span>{' '}
                    <span className="text-muted-foreground">{t.profile.likes}</span>
                  </span>
                  <span>
                    <span className="font-bold">{tweet.bookmarks_count}</span>{' '}
                    <span className="text-muted-foreground">{t.nav.bookmarks}</span>
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-around py-2 border-b border-border/50">
                  <button className="p-3 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeWidth="1.5" />
                    </svg>
                  </button>
                  <button className="p-3 rounded-full hover:bg-green-500/10 hover:text-green-500 transition-colors">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current">
                      <path d="M4 12.5V16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3.5M12 3v12m0 0l-4-4m4 4l4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button className="p-3 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeWidth="1.5" />
                    </svg>
                  </button>
                  <button className="p-3 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </article>

              {/* Reply Composer */}
              <div className="p-4 border-b border-border/50">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={user?.avatar || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.display_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={t.tweet.replyPlaceholder}
                      className="w-full min-h-[80px] bg-transparent resize-none outline-none text-lg placeholder:text-muted-foreground"
                      rows={2}
                    />
                    <div className="flex items-center justify-end gap-3">
                      <Button
                        onClick={handlePostReply}
                        disabled={isPosting || !replyContent.trim()}
                        className="rounded-full px-4 font-bold"
                      >
                        {isPosting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          t.tweet.reply
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Replies */}
              {replies.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>{t.tweetDetail.noReplies}</p>
                </div>
              ) : (
                replies.map((reply) => (
                  <TweetCard
                    key={reply.id}
                    tweet={reply}
                    onDelete={handleReplyDelete}
                    onUpdate={handleReplyUpdate}
                  />
                ))
              )}
            </>
          )}
        </div>
        <RightSidebar />
      </div>
      <MobileNav />
    </main>
  );
}
