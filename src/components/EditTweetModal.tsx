'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { TweetWithAuthor } from '@/lib/types';
import { Loader2, Save, RotateCcw } from 'lucide-react';

interface EditTweetModalProps {
  tweet: TweetWithAuthor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updatedTweet: TweetWithAuthor) => void;
}

export function EditTweetModal({ tweet, open, onOpenChange, onSuccess }: EditTweetModalProps) {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [content, setContent] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [retweetsCount, setRetweetsCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [quotesCount, setQuotesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [isPinned, setIsPinned] = useState(false);

  // Reset form when tweet changes
  useEffect(() => {
    if (tweet) {
      setContent(tweet.content);
      setLikesCount(tweet.likes_count || 0);
      setRetweetsCount(tweet.retweets_count || 0);
      setCommentsCount(tweet.comments_count || 0);
      setBookmarksCount(tweet.bookmarks_count || 0);
      setQuotesCount(tweet.quotes_count || 0);
      setViewsCount(tweet.views_count || 0);
      setIsPinned(tweet.is_pinned || false);
    }
  }, [tweet]);

  const handleSubmit = async () => {
    if (!tweet) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/tweets/${tweet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          likes_count: likesCount,
          retweets_count: retweetsCount,
          comments_count: commentsCount,
          bookmarks_count: bookmarksCount,
          quotes_count: quotesCount,
          views_count: viewsCount,
          is_pinned: isPinned,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess?.(data.data);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating tweet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (tweet) {
      setContent(tweet.content);
      setLikesCount(tweet.likes_count || 0);
      setRetweetsCount(tweet.retweets_count || 0);
      setCommentsCount(tweet.comments_count || 0);
      setBookmarksCount(tweet.bookmarks_count || 0);
      setQuotesCount(tweet.quotes_count || 0);
      setViewsCount(tweet.views_count || 0);
      setIsPinned(tweet.is_pinned || false);
    }
  };

  const generateRandomStats = () => {
    setLikesCount(Math.floor(Math.random() * 10000));
    setRetweetsCount(Math.floor(Math.random() * 5000));
    setCommentsCount(Math.floor(Math.random() * 2000));
    setBookmarksCount(Math.floor(Math.random() * 1000));
    setQuotesCount(Math.floor(Math.random() * 500));
    setViewsCount(Math.floor(Math.random() * 100000));
  };

  if (!tweet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[rgb(22,28,34)] border-[rgb(56,68,77)] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {language === 'zh' ? '编辑推文' : 'Edit Tweet'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-[15px]">
              {language === 'zh' ? '内容' : 'Content'}
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={language === 'zh' ? '推文内容...' : 'Tweet content...'}
              className="min-h-[100px] bg-[rgb(32,35,39)] border-[rgb(56,68,77)] text-white resize-none"
              maxLength={280}
            />
            <div className="text-xs text-[rgb(113,118,123)] text-right">
              {content.length}/280
            </div>
          </div>

          {/* Stats Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[15px]">{language === 'zh' ? '统计数据' : 'Statistics'}</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateRandomStats}
                className="text-[13px] text-primary hover:text-primary"
              >
                {language === 'zh' ? '随机生成' : 'Random'}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="likes" className="text-xs text-[rgb(113,118,123)]">
                  {language === 'zh' ? '点赞数' : 'Likes'}
                </Label>
                <Input
                  id="likes"
                  type="number"
                  min="0"
                  value={likesCount}
                  onChange={(e) => setLikesCount(parseInt(e.target.value) || 0)}
                  className="bg-[rgb(32,35,39)] border-[rgb(56,68,77)] text-white"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="retweets" className="text-xs text-[rgb(113,118,123)]">
                  {language === 'zh' ? '转推数' : 'Retweets'}
                </Label>
                <Input
                  id="retweets"
                  type="number"
                  min="0"
                  value={retweetsCount}
                  onChange={(e) => setRetweetsCount(parseInt(e.target.value) || 0)}
                  className="bg-[rgb(32,35,39)] border-[rgb(56,68,77)] text-white"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="comments" className="text-xs text-[rgb(113,118,123)]">
                  {language === 'zh' ? '评论数' : 'Comments'}
                </Label>
                <Input
                  id="comments"
                  type="number"
                  min="0"
                  value={commentsCount}
                  onChange={(e) => setCommentsCount(parseInt(e.target.value) || 0)}
                  className="bg-[rgb(32,35,39)] border-[rgb(56,68,77)] text-white"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="bookmarks" className="text-xs text-[rgb(113,118,123)]">
                  {language === 'zh' ? '书签数' : 'Bookmarks'}
                </Label>
                <Input
                  id="bookmarks"
                  type="number"
                  min="0"
                  value={bookmarksCount}
                  onChange={(e) => setBookmarksCount(parseInt(e.target.value) || 0)}
                  className="bg-[rgb(32,35,39)] border-[rgb(56,68,77)] text-white"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="quotes" className="text-xs text-[rgb(113,118,123)]">
                  {language === 'zh' ? '引用数' : 'Quotes'}
                </Label>
                <Input
                  id="quotes"
                  type="number"
                  min="0"
                  value={quotesCount}
                  onChange={(e) => setQuotesCount(parseInt(e.target.value) || 0)}
                  className="bg-[rgb(32,35,39)] border-[rgb(56,68,77)] text-white"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="views" className="text-xs text-[rgb(113,118,123)]">
                  {language === 'zh' ? '浏览量' : 'Views'}
                </Label>
                <Input
                  id="views"
                  type="number"
                  min="0"
                  value={viewsCount}
                  onChange={(e) => setViewsCount(parseInt(e.target.value) || 0)}
                  className="bg-[rgb(32,35,39)] border-[rgb(56,68,77)] text-white"
                />
              </div>
            </div>
          </div>

          {/* Pin Tweet */}
          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="text-[15px]">{language === 'zh' ? '置顶推文' : 'Pin Tweet'}</Label>
              <p className="text-xs text-[rgb(113,118,123)]">
                {language === 'zh' ? '将此推文固定在个人主页顶部' : 'Pin this tweet to your profile'}
              </p>
            </div>
            <Switch
              checked={isPinned}
              onCheckedChange={setIsPinned}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-[15px] font-bold"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {language === 'zh' ? '重置' : 'Reset'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !content.trim()}
            className="bg-[rgb(29,155,240)] hover:bg-[rgb(26,140,216)] text-white text-[15px] font-bold"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {language === 'zh' ? '保存' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
