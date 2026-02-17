'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Image, 
  X, 
  Loader2, 
  Smile, 
  Calendar, 
  MapPin,
  List,
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ComposeTweetProps {
  onSuccess?: () => void;
  placeholder?: string;
  replyTo?: {
    username: string;
    displayName: string;
  };
}

export function ComposeTweet({ onSuccess, placeholder, replyTo }: ComposeTweetProps) {
  const { user } = useUser();
  const { t, language } = useLanguage();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || images.length >= 4) return;

    const file = files[0];
    if (!file || !file.type.startsWith('image/')) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setImages(prev => [...prev, data.data.url].slice(0, 4));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/tweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          images: images.length > 0 ? images : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setContent('');
        setImages([]);
        setIsFocused(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error posting tweet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const remainingChars = 280 - content.length;
  const isOverLimit = remainingChars < 0;
  const showActions = isFocused || content.length > 0 || images.length > 0;

  const actionButtons = [
    { 
      icon: Image, 
      label: 'Image',
      onClick: () => fileInputRef.current?.click(),
      disabled: images.length >= 4
    },
    { icon: null, label: 'GIF', onClick: () => {}, disabled: true },
    { icon: List, label: 'Poll', onClick: () => {}, disabled: true },
    { icon: Smile, label: 'Emoji', onClick: () => {}, disabled: true },
    { icon: Calendar, label: 'Schedule', onClick: () => {}, disabled: true },
    { icon: MapPin, label: 'Location', onClick: () => {}, disabled: true },
  ];

  return (
    <div className={cn(
      'px-4 py-3 border-b border-[rgb(47,51,54)]',
      isFocused && 'bg-[rgb(21,24,28)]'
    )}>
      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center gap-1 text-[13px] text-[rgb(113,118,123)] mb-2 -mt-1">
          <span>{language === 'zh' ? '回复' : 'Replying to'}</span>
          <Link href={`/user/${replyTo.username}`} className="text-primary hover:underline">
            @{replyTo.username}
          </Link>
        </div>
      )}

      <div className="flex gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={user?.avatar || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {user?.display_name?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder || t.tweet.placeholder}
            className="w-full bg-transparent resize-none outline-none text-[17px] leading-[1.3125] placeholder:text-[rgb(113,118,123)] min-h-[56px]"
            rows={1}
            style={{ 
              height: 'auto',
              overflow: content.split('\n').length > 4 ? 'auto' : 'hidden'
            }}
          />

          {/* Image Previews - Twitter style */}
          {images.length > 0 && (
            <div className={cn(
              'mt-3 rounded-2xl overflow-hidden border border-[rgb(47,51,54)]',
              images.length === 1 ? '' : 'grid gap-0.5',
              images.length === 2 && 'grid-cols-2',
              images.length === 3 && 'grid-cols-2 grid-rows-2',
              images.length >= 4 && 'grid-cols-2 grid-rows-2'
            )}>
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    'relative',
                    images.length === 3 && idx === 0 && 'row-span-2',
                    images.length === 1 ? 'max-h-[280px]' : 'h-44'
                  )}
                >
                  <img
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black/90 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-between mt-3 pt-1">
              {/* Left actions */}
              <div className="flex items-center gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={images.length >= 4 || isLoading}
                />
                
                {actionButtons.slice(0, 6).map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={cn(
                      'p-2 rounded-full transition-colors flex items-center justify-center',
                      action.disabled 
                        ? 'text-[rgb(113,118,123)]/50 cursor-not-allowed' 
                        : 'text-primary hover:bg-primary/10'
                    )}
                    title={action.label}
                  >
                    {action.icon ? (
                      <action.icon className="w-5 h-5" />
                    ) : (
                      <span className="text-[13px] font-bold">{action.label}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-3">
                {/* Character count */}
                {content.length > 0 && (
                  <div className="flex items-center gap-2">
                    {/* Progress circle */}
                    <div className="relative w-6 h-6">
                      <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className={cn(
                            isOverLimit ? 'text-[rgb(244,33,46)]' : 
                            remainingChars <= 20 ? 'text-[rgb(255,173,31)]' : 
                            'text-[rgb(113,118,123)]'
                          )}
                          strokeDasharray={`${((280 - remainingChars) / 280) * 62.8} 62.8`}
                        />
                      </svg>
                      {remainingChars <= 20 && (
                        <span className={cn(
                          'absolute inset-0 flex items-center justify-center text-[11px]',
                          isOverLimit ? 'text-[rgb(244,33,46)]' : 'text-[rgb(255,173,31)]'
                        )}>
                          {remainingChars}
                        </span>
                      )}
                    </div>
                    
                    {isOverLimit && (
                      <span className="text-[13px] text-[rgb(244,33,46)]">
                        {-remainingChars}
                      </span>
                    )}
                  </div>
                )}

                {/* Divider */}
                <div className="w-px h-6 bg-[rgb(47,51,54)]" />

                {/* Post button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || (!content.trim() && images.length === 0) || isOverLimit}
                  className="rounded-full px-4 py-1.5 h-[34px] font-bold text-[15px] bg-[rgb(29,155,240)] hover:bg-[rgb(26,140,216)] disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : replyTo ? (
                    language === 'zh' ? '回复' : 'Reply'
                  ) : (
                    t.tweet.post
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
