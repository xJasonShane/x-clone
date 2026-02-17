'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MessageCircle,
  Repeat2,
  Heart,
  BarChart3,
  PenLine,
  Trash2,
  MoreHorizontal,
  Flag,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { TweetWithAuthor } from '@/lib/types';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { QuoteTweetModal } from './QuoteTweetModal';
import { EditTweetModal } from './EditTweetModal';
import { EditTimeModal } from './EditTimeModal';

interface TweetCardProps {
  tweet: TweetWithAuthor;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<TweetWithAuthor>) => void;
  showStats?: boolean;
  isReply?: boolean;
}

export function TweetCard({ tweet, onDelete, onUpdate, showStats = false, isReply = false }: TweetCardProps) {
  const { language } = useLanguage();
  const [isLiked, setIsLiked] = useState(tweet.is_liked);
  const [isRetweeted, setIsRetweeted] = useState(tweet.is_retweeted);
  const [likesCount, setLikesCount] = useState(tweet.likes_count);
  const [retweetsCount, setRetweetsCount] = useState(tweet.retweets_count);
  const [quotesCount, setQuotesCount] = useState(tweet.quotes_count || 0);
  const [viewsCount, setViewsCount] = useState(tweet.views_count || 0);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showRetweetMenu, setShowRetweetMenu] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditTimeModal, setShowEditTimeModal] = useState(false);

  // Sync local state when tweet prop changes (e.g., after edit)
  useEffect(() => {
    setIsLiked(tweet.is_liked);
    setIsRetweeted(tweet.is_retweeted);
    setLikesCount(tweet.likes_count);
    setRetweetsCount(tweet.retweets_count);
    setQuotesCount(tweet.quotes_count || 0);
    setViewsCount(tweet.views_count || 0);
  }, [tweet]);

  const handleLike = async () => {
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetId: tweet.id }),
      });
      const data = await res.json();
      if (data.success) {
        setIsLiked(data.liked);
        setLikesCount(prev => (data.liked ? prev + 1 : Math.max(0, prev - 1)));
        onUpdate?.(tweet.id, { is_liked: data.liked, likes_count: likesCount });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleRetweet = async () => {
    try {
      const res = await fetch('/api/retweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetId: tweet.id }),
      });
      const data = await res.json();
      if (data.success) {
        setIsRetweeted(data.retweeted);
        setRetweetsCount(prev => (data.retweeted ? prev + 1 : Math.max(0, prev - 1)));
        onUpdate?.(tweet.id, { is_retweeted: data.retweeted, retweets_count: retweetsCount });
      }
    } catch (error) {
      console.error('Error toggling retweet:', error);
    }
    setShowRetweetMenu(false);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/tweets/${tweet.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        onDelete?.(tweet.id);
      }
    } catch (error) {
      console.error('Error deleting tweet:', error);
    }
  };

  const handleQuoteSuccess = () => {
    setQuotesCount(prev => prev + 1);
    onUpdate?.(tweet.id, { quotes_count: quotesCount + 1 });
  };

  const handleEditSuccess = (updatedTweet: TweetWithAuthor) => {
    onUpdate?.(tweet.id, updatedTweet);
  };

  const handleEditTimeSuccess = (updatedTweet: TweetWithAuthor) => {
    onUpdate?.(tweet.id, updatedTweet);
  };

  const locale = language === 'zh' ? zhCN : enUS;
  const now = new Date();
  const tweetDate = new Date(tweet.created_at);
  const diffInHours = (now.getTime() - tweetDate.getTime()) / (1000 * 60 * 60);

  const formatTime = () => {
    if (diffInHours < 24) {
      return formatDistanceToNow(tweetDate, { addSuffix: false, locale }).replace(
        language === 'zh' ? '大约 ' : 'about ',
        ''
      );
    } else if (tweetDate.getFullYear() === now.getFullYear()) {
      return format(tweetDate, language === 'zh' ? 'M月d日' : 'MMM d');
    } else {
      return format(tweetDate, language === 'zh' ? 'yyyy年M月d日' : 'MMM d, yyyy');
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getImageGridClass = () => {
    const count = tweet.images?.length || 0;
    if (count === 1) return 'max-h-[510px]';
    if (count === 2) return 'grid-cols-2 grid-rows-1';
    if (count === 3) return 'grid-cols-2 grid-rows-2';
    return 'grid-cols-2 grid-rows-2';
  };

  return (
    <article className="group relative flex gap-3 px-4 py-3 border-b border-[rgb(47,51,54)] hover:bg-white/[0.03] transition-colors">
      {/* Avatar */}
      <Link 
        href={`/user/${tweet.author.username}`} 
        className="flex-shrink-0 relative z-10"
      >
        <Avatar className="w-10 h-10 hover:opacity-80 transition-opacity">
          <AvatarImage src={tweet.author.avatar || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {tweet.author.display_name[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1 flex-wrap min-w-0">
            <Link
              href={`/user/${tweet.author.username}`}
              className="font-bold text-[15px] hover:underline truncate max-w-[150px]"
            >
              {tweet.author.display_name}
            </Link>
            <Link
              href={`/user/${tweet.author.username}`}
              className="text-[rgb(113,118,123)] hover:underline truncate"
            >
              @{tweet.author.username}
            </Link>
            <span className="text-[rgb(113,118,123)]">·</span>
            <button
              onClick={() => setShowEditTimeModal(true)}
              className="text-[rgb(113,118,123)] hover:underline whitespace-nowrap cursor-pointer"
            >
              {formatTime()}
            </button>
          </div>

          {/* More options menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 -m-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-primary/10 hover:text-primary transition-all relative z-20"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[240px] bg-[rgb(22,28,34)] border-[rgb(56,68,77)] z-50">
              <DropdownMenuItem
                onClick={() => setShowEditModal(true)}
                className="py-3 focus:bg-white/[0.1] cursor-pointer"
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                {language === 'zh' ? '编辑数据' : 'Edit stats'}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[rgb(56,68,77)]" />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-[rgb(244,33,46)] focus:text-[rgb(244,33,46)] focus:bg-white/[0.1] py-3 cursor-pointer"
              >
                <Trash2 className="w-5 h-5 mr-3" />
                {language === 'zh' ? '删除' : 'Delete'}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[rgb(56,68,77)]" />
              <DropdownMenuItem className="py-3 focus:bg-white/[0.1] cursor-pointer">
                <Flag className="w-5 h-5 mr-3" />
                {language === 'zh' ? '举报推文' : 'Report post'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Reply indicator */}
        {isReply && tweet.parent_id && (
          <div className="text-[13px] text-[rgb(113,118,123)] mb-1">
            {language === 'zh' ? '回复' : 'Replying to'}{' '}
            <Link href={`/user/${tweet.author.username}`} className="text-primary hover:underline">
              @{tweet.author.username}
            </Link>
          </div>
        )}

        {/* Tweet content */}
        <p className="text-[15px] leading-[1.3125rem] whitespace-pre-wrap break-words mt-0.5">
          {tweet.content}
        </p>

        {/* Images - Twitter style grid */}
        {tweet.images && tweet.images.length > 0 && (
          <div
            className={cn(
              'mt-3 rounded-2xl overflow-hidden border border-[rgb(47,51,54)] cursor-pointer',
              getImageGridClass(),
              'grid gap-0.5'
            )}
          >
            {tweet.images.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                className={cn(
                  'relative',
                  tweet.images!.length === 3 && idx === 0 && 'row-span-2',
                  tweet.images!.length === 1 && 'h-auto max-h-[510px]',
                  tweet.images!.length > 1 && 'h-52'
                )}
                onClick={() => {
                  setPreviewImageIndex(idx);
                  setShowImagePreview(true);
                }}
              >
                <img
                  src={img}
                  alt={`Tweet image ${idx + 1}`}
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                />
              </div>
            ))}
          </div>
        )}

        {/* Stats bar (shown on detail page) */}
        {showStats && (
          <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[rgb(47,51,54)] text-[13px]">
            <span className="font-bold">{formatNumber(retweetsCount)}</span>
            <span className="text-[rgb(113,118,123)]">{language === 'zh' ? '转推' : 'Reposts'}</span>
            <span className="mx-1 text-[rgb(113,118,123)]">·</span>
            <span className="font-bold">{formatNumber(quotesCount)}</span>
            <span className="text-[rgb(113,118,123)]">{language === 'zh' ? '引用' : 'Quotes'}</span>
            <span className="mx-1 text-[rgb(113,118,123)]">·</span>
            <span className="font-bold">{formatNumber(likesCount)}</span>
            <span className="text-[rgb(113,118,123)]">{language === 'zh' ? '喜欢' : 'Likes'}</span>
            <span className="mx-1 text-[rgb(113,118,123)]">·</span>
            <span className="font-bold">{formatNumber(viewsCount)}</span>
            <span className="text-[rgb(113,118,123)]">{language === 'zh' ? '查看' : 'Views'}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-1 -mb-1 max-w-[425px]">
          {/* Reply */}
          <Link
            href={`/tweet/${tweet.id}`}
            className="flex items-center gap-1 group/reply min-w-[56px]"
          >
            <div className="p-2 -m-2 rounded-full group-hover/reply:bg-primary/10 transition-colors">
              <MessageCircle className="w-5 h-5 text-[rgb(113,118,123)] group-hover/reply:text-primary" />
            </div>
            <span className="text-[13px] text-[rgb(113,118,123)] group-hover/reply:text-primary">
              {tweet.comments_count || 0}
            </span>
          </Link>

          {/* Retweet with dropdown */}
          <DropdownMenu open={showRetweetMenu} onOpenChange={setShowRetweetMenu}>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1 group/retweet min-w-[56px]"
              >
                <div className={cn(
                  'p-2 -m-2 rounded-full transition-colors',
                  isRetweeted ? 'text-[rgb(0,186,124)]' : 'group-hover/retweet:bg-[rgb(0,186,124)]/10'
                )}>
                  <Repeat2
                    className={cn(
                      'w-5 h-5',
                      isRetweeted ? 'text-[rgb(0,186,124)]' : 'text-[rgb(113,118,123)] group-hover/retweet:text-[rgb(0,186,124)]'
                    )}
                  />
                </div>
                <span className={cn(
                  'text-[13px]',
                  isRetweeted ? 'text-[rgb(0,186,124)]' : 'text-[rgb(113,118,123)] group-hover/retweet:text-[rgb(0,186,124)]'
                )}>
                  {formatNumber(retweetsCount)}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px] bg-[rgb(22,28,34)] border-[rgb(56,68,77)] z-50">
              <DropdownMenuItem
                onClick={handleRetweet}
                className="py-3 focus:bg-white/[0.1] cursor-pointer"
              >
                <Repeat2 className="w-5 h-5 mr-3" />
                {language === 'zh' ? '转推' : 'Repost'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => { setShowRetweetMenu(false); setShowQuoteModal(true); }}
                className="py-3 focus:bg-white/[0.1] cursor-pointer"
              >
                <PenLine className="w-5 h-5 mr-3" />
                {language === 'zh' ? '引用' : 'Quote'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Like */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1 group/like min-w-[56px]"
          >
            <div className={cn(
              'p-2 -m-2 rounded-full transition-colors',
              isLiked ? 'text-[rgb(249,24,128)]' : 'group-hover/like:bg-[rgb(249,24,128)]/10'
            )}>
              <Heart
                className={cn(
                  'w-5 h-5 transition-transform',
                  isLiked
                    ? 'text-[rgb(249,24,128)] fill-[rgb(249,24,128)] scale-110'
                    : 'text-[rgb(113,118,123)] group-hover/like:text-[rgb(249,24,128)]'
                )}
              />
            </div>
            <span className={cn(
              'text-[13px]',
              isLiked ? 'text-[rgb(249,24,128)]' : 'text-[rgb(113,118,123)] group-hover/like:text-[rgb(249,24,128)]'
            )}>
              {formatNumber(likesCount)}
            </span>
          </button>

          {/* Views */}
          <button className="flex items-center gap-1 group/views min-w-[56px]">
            <div className="p-2 -m-2 rounded-full group-hover/views:bg-primary/10 transition-colors">
              <BarChart3 className="w-5 h-5 text-[rgb(113,118,123)] group-hover/views:text-primary" />
            </div>
            <span className="text-[13px] text-[rgb(113,118,123)] group-hover/views:text-primary">
              {formatNumber(viewsCount)}
            </span>
          </button>
        </div>
      </div>

      {/* Clickable overlay for navigating to tweet detail */}
      <Link
        href={`/tweet/${tweet.id}`}
        className="absolute inset-0 z-0"
        onClick={(e) => {
          // Prevent navigation when clicking on interactive elements
          const target = e.target as HTMLElement;
          if (
            target.closest('button') ||
            target.closest('a') ||
            target.closest('[role="menu"]') ||
            target.closest('[role="dialog"]') ||
            target.closest('[data-radix-collection-item]')
          ) {
            e.preventDefault();
          }
        }}
      />

      {/* Quote Tweet Modal */}
      <QuoteTweetModal
        tweet={tweet}
        open={showQuoteModal}
        onOpenChange={setShowQuoteModal}
        onSuccess={handleQuoteSuccess}
      />

      {/* Edit Tweet Modal */}
      <EditTweetModal
        tweet={tweet}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSuccess={handleEditSuccess}
      />

      {/* Edit Time Modal */}
      <EditTimeModal
        tweet={tweet}
        open={showEditTimeModal}
        onOpenChange={setShowEditTimeModal}
        onSuccess={handleEditTimeSuccess}
      />

      {/* Image Preview Modal */}
      <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-black border-none flex items-center justify-center">
          <img
            src={tweet.images?.[previewImageIndex]}
            alt={`Preview ${previewImageIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain"
          />
        </DialogContent>
      </Dialog>
    </article>
  );
}
