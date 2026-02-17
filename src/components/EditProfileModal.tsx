'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, Camera, Loader2 } from 'lucide-react';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const { user, refreshUser } = useUser();
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && open) {
      setDisplayName(user.display_name);
      setBio(user.bio || '');
    }
  }, [user, open]);

  const handleSubmit = async () => {
    if (!displayName.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await refreshUser();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-card max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="sticky top-0 z-10 bg-card border-b border-border/50 px-4 py-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-full hover:bg-accent/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <DialogTitle className="text-xl font-bold">{t.editProfile.title}</DialogTitle>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !displayName.trim()}
            className="rounded-full font-bold px-4"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.common.save}
          </Button>
        </DialogHeader>

        {/* Cover Image */}
        <div className="h-52 bg-gradient-to-br from-primary/20 to-primary/5 relative">
          <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/60 transition-colors">
            <Camera className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Avatar */}
        <div className="-mt-16 px-4 relative">
          <Avatar className="w-28 h-28 border-4 border-card">
            <AvatarImage src={user?.avatar || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
              {user?.display_name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <button className="absolute bottom-2 left-16 p-2 rounded-full bg-black/50 hover:bg-black/60 transition-colors">
            <Camera className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Display Name */}
          <div className="border border-border/50 rounded-lg focus-within:border-primary">
            <div className="px-4 pt-2 text-sm text-muted-foreground">{t.editProfile.name}</div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              className="w-full px-4 py-2 bg-transparent outline-none text-[15px]"
              placeholder={t.editProfile.name}
            />
            <div className="px-4 pb-2 text-right text-xs text-muted-foreground">
              {displayName.length}/50
            </div>
          </div>

          {/* Bio */}
          <div className="border border-border/50 rounded-lg focus-within:border-primary">
            <div className="px-4 pt-2 text-sm text-muted-foreground">{t.editProfile.bio}</div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
              className="w-full px-4 py-2 bg-transparent outline-none text-[15px] resize-none"
              placeholder={t.editProfile.bio}
            />
            <div className="px-4 pb-2 text-right text-xs text-muted-foreground">
              {bio.length}/160
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
