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
import { useLanguage } from '@/contexts/LanguageContext';
import { TweetWithAuthor } from '@/lib/types';
import { Loader2, Calendar, Clock } from 'lucide-react';

interface EditTimeModalProps {
  tweet: TweetWithAuthor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updatedTweet: TweetWithAuthor) => void;
}

export function EditTimeModal({ tweet, open, onOpenChange, onSuccess }: EditTimeModalProps) {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Reset form when tweet changes
  useEffect(() => {
    if (tweet && tweet.created_at) {
      const tweetDate = new Date(tweet.created_at);
      // Format date as YYYY-MM-DD
      const year = tweetDate.getFullYear();
      const month = String(tweetDate.getMonth() + 1).padStart(2, '0');
      const day = String(tweetDate.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      
      // Format time as HH:MM
      const hours = String(tweetDate.getHours()).padStart(2, '0');
      const minutes = String(tweetDate.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    }
  }, [tweet]);

  const handleSubmit = async () => {
    if (!tweet || !date || !time) return;

    setIsLoading(true);
    try {
      // Combine date and time into ISO string
      const newCreatedAt = new Date(`${date}T${time}:00`).toISOString();
      
      const res = await fetch(`/api/tweets/${tweet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          created_at: newCreatedAt,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess?.(data.data);
        onOpenChange(false);
      } else {
        alert(data.error || 'Failed to update time');
      }
    } catch (error) {
      console.error('Error updating tweet time:', error);
      alert('Failed to update time');
    } finally {
      setIsLoading(false);
    }
  };

  const setToNow = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setDate(`${year}-${month}-${day}`);
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setTime(`${hours}:${minutes}`);
  };

  const setRandomPastTime = () => {
    const now = new Date();
    // Random time in the past 30 days
    const randomDays = Math.floor(Math.random() * 30);
    const randomHours = Math.floor(Math.random() * 24);
    const randomMinutes = Math.floor(Math.random() * 60);
    
    const pastDate = new Date(now);
    pastDate.setDate(pastDate.getDate() - randomDays);
    pastDate.setHours(pastDate.getHours() - randomHours);
    pastDate.setMinutes(pastDate.getMinutes() - randomMinutes);
    
    const year = pastDate.getFullYear();
    const month = String(pastDate.getMonth() + 1).padStart(2, '0');
    const day = String(pastDate.getDate()).padStart(2, '0');
    setDate(`${year}-${month}-${day}`);
    
    const hours = String(pastDate.getHours()).padStart(2, '0');
    const minutes = String(pastDate.getMinutes()).padStart(2, '0');
    setTime(`${hours}:${minutes}`);
  };

  if (!tweet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[rgb(22,28,34)] border-[rgb(56,68,77)] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {language === 'zh' ? '修改发布时间' : 'Edit Post Time'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-[15px] flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {language === 'zh' ? '日期' : 'Date'}
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[rgb(32,35,39)] border-[rgb(56,68,77)] text-white"
            />
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="time" className="text-[15px] flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {language === 'zh' ? '时间' : 'Time'}
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-[rgb(32,35,39)] border-[rgb(56,68,77)] text-white"
            />
          </div>

          {/* Quick actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={setToNow}
              className="flex-1 border-[rgb(56,68,77)] text-white hover:bg-white/[0.1]"
            >
              {language === 'zh' ? '现在' : 'Now'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={setRandomPastTime}
              className="flex-1 border-[rgb(56,68,77)] text-white hover:bg-white/[0.1]"
            >
              {language === 'zh' ? '随机过去' : 'Random Past'}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-[15px] font-bold"
          >
            {language === 'zh' ? '取消' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !date || !time}
            className="bg-[rgb(29,155,240)] hover:bg-[rgb(26,140,216)] text-white text-[15px] font-bold"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {language === 'zh' ? '保存' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
