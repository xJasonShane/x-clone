'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { RightSidebar } from '@/components/RightSidebar';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from 'lucide-react';
import { EditProfileModal } from '@/components/EditProfileModal';

export default function ProfilePage() {
  const { user } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      <div className="flex justify-center max-w-[1300px] mx-auto">
        <div className="flex-shrink-0">
          <Sidebar onEditProfile={() => setIsEditModalOpen(true)} />
        </div>
        <div className="flex-1 min-w-0 max-w-[600px] border-x border-border/50 min-h-screen">
          <div className="bg-card">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 relative">
              {user?.cover_image && (
                <img
                  src={user.cover_image}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Profile Header */}
            <div className="px-4 pb-4">
              {/* Avatar and Edit Button */}
              <div className="-mt-16 mb-4 flex justify-between items-end">
                <Avatar className="w-28 h-28 md:w-32 md:h-32 border-4 border-background">
                  <AvatarImage src={user?.avatar || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                    {user?.display_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  className="rounded-full font-bold text-sm px-4 h-8"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  编辑个人资料
                </Button>
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div>
                  <h1 className="text-xl font-bold">{user?.display_name || '用户'}</h1>
                  <p className="text-muted-foreground">@{user?.username || 'user'}</p>
                </div>

                {user?.bio && (
                  <p className="text-[15px] leading-relaxed">{user.bio}</p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    加入于 {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' }) : '未知'}
                  </span>
                </div>

                <div className="flex gap-4 text-sm">
                  <span>
                    <span className="font-bold">0</span>{' '}
                    <span className="text-muted-foreground">正在关注</span>
                  </span>
                  <span>
                    <span className="font-bold">0</span>{' '}
                    <span className="text-muted-foreground">关注者</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border/50">
              {['推文', '回复', '媒体', '喜欢'].map((tab, idx) => (
                <button
                  key={tab}
                  className={`flex-1 py-4 text-center text-[15px] font-medium transition-colors hover:bg-accent/30 ${
                    idx === 0 ? 'border-b-2 border-primary' : 'text-muted-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Empty State */}
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">还没有发布推文</p>
              <p className="text-sm mt-1">发布的推文会显示在这里</p>
            </div>
          </div>
        </div>
        <RightSidebar />
      </div>
      <EditProfileModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} />
    </main>
  );
}
