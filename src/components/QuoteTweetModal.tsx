'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';
import { TweetWithAuthor } from '@/lib/types';
import Link from 'next/link';

interface QuoteTweetModalProps {
  tweet: TweetWithAuthor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function QuoteTweetModal({ tweet, open, onOpenChange, onSuccess }: QuoteTweetModalProps) {
  const { user } = useUser();
  const { language } = useLanguage();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/tweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          quoteId: tweet.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setContent('');
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error posting quote tweet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const remainingChars = 280 - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] bg-black border-[rgb(47,51,54)] text-white">
        <DialogHeader>
          <DialogTitle className="sr-only">{language === 'zh' ? '引用推文' : 'Quote Tweet'}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={user?.avatar || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.display_name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={language === 'zh' ? '添加评论...' : 'Add a comment...'}
              className="w-full min-h-[80px] bg-transparent text-xl placeholder:text-[rgb(113,118,123)] resize-none focus:outline-none"
              autoFocus
            />

            {/* Quoted tweet preview */}
            <div className="mt-2 p-3 rounded-2xl border border-[rgb(47,51,54)] hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={tweet.author.avatar || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {tweet.author.display_name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Link 
                  href={`/user/${tweet.author.username}`} 
                  className="font-bold text-[13px] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {tweet.author.display_name}
                </Link>
                <Link 
                  href={`/user/${tweet.author.username}`} 
                  className="text-[13px] text-[rgb(113,118,123)] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  @{tweet.author.username}
                </Link>
              </div>
              <p className="text-[13px] text-[rgb(113,118,123)] line-clamp-3">
                {tweet.content}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[rgb(47,51,54)]">
          <div className="flex items-center gap-2">
            {content.length > 0 && (
              <span
                className={`text-sm ${
                  isOverLimit
                    ? 'text-[rgb(244,33,46)]'
                    : remainingChars <= 20
                    ? 'text-[rgb(255,173,31)]'
                    : 'text-[rgb(113,118,123)]'
                }`}
              >
                {remainingChars}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-[15px] font-bold px-4 py-1.5 h-auto"
            >
              {language === 'zh' ? '取消' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isOverLimit || isLoading}
              className="rounded-full bg-[rgb(29,155,240)] hover:bg-[rgb(26,140,216)] text-white text-[15px] font-bold px-4 py-1.5 h-auto disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                language === 'zh' ? '发布' : 'Post'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
