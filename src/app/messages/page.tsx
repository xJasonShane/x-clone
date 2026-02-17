'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { RightSidebar } from '@/components/RightSidebar';
import { MobileNav } from '@/components/MobileNav';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Settings, Edit, MoreHorizontal, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  user: {
    username: string;
    display_name: string;
    avatar: string | null;
    verified?: boolean;
  };
  last_message: string;
  timestamp: string;
  unread: number;
}

export default function MessagesPage() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      user: { username: 'nextjs', display_name: 'Next.js', avatar: null, verified: true },
      last_message: language === 'zh' ? '你好！欢迎来到 Next.js 社区！' : 'Hey! Welcome to the Next.js community!',
      timestamp: '2h',
      unread: 2,
    },
    {
      id: '2',
      user: { username: 'vercel', display_name: 'Vercel', avatar: null, verified: true },
      last_message: language === 'zh' ? '部署成功！' : 'Deployment successful!',
      timestamp: '5h',
      unread: 0,
    },
    {
      id: '3',
      user: { username: 'reactjs', display_name: 'React', avatar: null, verified: true },
      last_message: language === 'zh' ? '新版本已发布！' : 'New version released!',
      timestamp: '1d',
      unread: 0,
    },
  ]);

  return (
    <main className="min-h-screen bg-background pb-14 xl:pb-0">
      <div className="flex justify-center max-w-[1300px] mx-auto">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 min-w-0 max-w-[600px] border-x border-[rgb(47,51,54)] min-h-screen">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-[rgb(47,51,54)]">
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className="text-xl font-bold">{t.nav.messages}</h1>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Edit className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Search */}
            {conversations.length > 0 && (
              <div className="px-4 pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(113,118,123)]" />
                  <Input
                    type="text"
                    placeholder={language === 'zh' ? '搜索私信' : 'Search Direct Messages'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-[38px] bg-[rgb(32,35,39)] border-none rounded-full text-[15px]"
                  />
                </div>
              </div>
            )}
          </div>

          {conversations.length === 0 ? (
            <div className="text-center py-16 px-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[rgb(30,39,50)] flex items-center justify-center">
                <Mail className="w-8 h-8 text-[rgb(113,118,123)]" />
              </div>
              <h2 className="text-[31px] font-bold mb-2">
                {language === 'zh' ? '欢迎来到私信' : 'Welcome to your inbox!'}
              </h2>
              <p className="text-[15px] text-[rgb(113,118,123)] mb-6 max-w-[300px] mx-auto">
                {language === 'zh' 
                  ? '发送私信给朋友或群组，开始一对一对话' 
                  : 'Send private messages to friends or groups'}
              </p>
              <Button className="rounded-full px-4 py-2 font-bold bg-[rgb(29,155,240)] hover:bg-[rgb(26,140,216)]">
                {language === 'zh' ? '开始对话' : 'Write a message'}
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[rgb(47,51,54)]">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage src={conversation.user.avatar || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {conversation.user.display_name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-[15px]">
                          {conversation.user.display_name}
                        </span>
                        {conversation.user.verified && (
                          <svg viewBox="0 0 22 22" className="w-4 h-4 fill-primary">
                            <path d="M20.396 11c-.018-.946-.082-1.856-.184-2.714a9.024 9.024 0 0 0-.712-2.472 6.865 6.865 0 0 0-1.358-2.027 6.865 6.865 0 0 0-2.027-1.358 9.024 9.024 0 0 0-2.472-.712A21.46 21.46 0 0 0 11 1.604c-.946.018-1.856.082-2.714.184a9.024 9.024 0 0 0-2.472.712 6.865 6.865 0 0 0-2.027 1.358 6.865 6.865 0 0 0-1.358 2.027 9.024 9.024 0 0 0-.712 2.472A21.46 21.46 0 0 0 1.604 11c.018.946.082 1.856.184 2.714a9.024 9.024 0 0 0 .712 2.472 6.865 6.865 0 0 0 1.358 2.027 6.865 6.865 0 0 0 2.027 1.358 9.024 9.024 0 0 0 2.472.712c.858.102 1.768.166 2.714.184.946-.018 1.856-.082 2.714-.184a9.024 9.024 0 0 0 2.472-.712 6.865 6.865 0 0 0 2.027-1.358 6.865 6.865 0 0 0 1.358-2.027 9.024 9.024 0 0 0 .712-2.472c.102-.858.166-1.768.184-2.714zM11 16.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-[13px] text-[rgb(113,118,123)]">
                        {conversation.timestamp}
                      </span>
                    </div>
                    <p className={cn(
                      'text-[15px] truncate',
                      conversation.unread > 0 ? 'text-white font-medium' : 'text-[rgb(113,118,123)]'
                    )}>
                      {conversation.last_message}
                    </p>
                  </div>

                  {conversation.unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                      {conversation.unread}
                    </div>
                  )}
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
