'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { RightSidebar } from '@/components/RightSidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  ChevronRight,
  Globe,
  Check,
  User,
  Shield,
  Lock,
  Bell,
  Palette,
  Database,
  Info,
  Moon,
  Sun,
  Monitor,
  Trash2,
  Download,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type SettingsView = 
  | 'main' 
  | 'account' 
  | 'security' 
  | 'privacy' 
  | 'notifications' 
  | 'display' 
  | 'language' 
  | 'data' 
  | 'about';

interface SettingsState {
  privateAccount: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  notifyLikes: boolean;
  notifyRetweets: boolean;
  notifyMentions: boolean;
  notifyFollows: boolean;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  allowDM: 'everyone' | 'following' | 'noone';
}

export default function SettingsPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { user, refreshUser } = useUser();
  const [view, setView] = useState<SettingsView>('main');
  const [isSaving, setIsSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Account deletion
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<SettingsState>({
    privateAccount: false,
    pushNotifications: true,
    emailNotifications: false,
    notifyLikes: true,
    notifyRetweets: true,
    notifyMentions: true,
    notifyFollows: true,
    theme: 'dark',
    fontSize: 'medium',
    allowDM: 'everyone',
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('twitter-clone-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user]);

  const saveSettings = (newSettings: Partial<SettingsState>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('twitter-clone-settings', JSON.stringify(updated));
  };

  const handleLanguageChange = (lang: 'zh' | 'en') => {
    setLanguage(lang);
  };

  const handleUsernameSave = async () => {
    if (!username.trim() || username === user?.username) return;
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        setShowUsernameForm(false);
      } else {
        alert(data.error || 'Failed to update username');
      }
    } catch (error) {
      console.error('Error updating username:', error);
      alert('Failed to update username');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    
    if (newPassword.length < 8) {
      setPasswordError(t.settings.passwordTooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t.settings.passwordMismatch);
      return;
    }

    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.username) return;
    
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    // In real app, would redirect to logout
  };

  const settingsItems = [
    {
      icon: <User className="w-5 h-5" />,
      label: t.settings.account,
      onClick: () => setView('account'),
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: t.settings.security,
      onClick: () => setView('security'),
    },
    {
      icon: <Lock className="w-5 h-5" />,
      label: t.settings.privacy,
      onClick: () => setView('privacy'),
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: t.settings.notifications,
      onClick: () => setView('notifications'),
    },
    {
      icon: <Palette className="w-5 h-5" />,
      label: t.settings.display,
      onClick: () => setView('display'),
    },
    {
      icon: <Globe className="w-5 h-5" />,
      label: t.settings.language,
      onClick: () => setView('language'),
    },
    {
      icon: <Database className="w-5 h-5" />,
      label: t.settings.data,
      onClick: () => setView('data'),
    },
    {
      icon: <Info className="w-5 h-5" />,
      label: t.settings.about,
      onClick: () => setView('about'),
    },
  ];

  const renderBackButton = (targetView: SettingsView = 'main') => (
    <button
      onClick={() => setView(targetView)}
      className="p-2 rounded-full hover:bg-accent/50 transition-colors"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );

  const renderMainView = () => (
    <>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-6 px-4 py-2">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-accent/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">{t.settings.title}</h1>
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {settingsItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">{item.icon}</span>
              <span className="text-[15px]">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}
      </div>
    </>
  );

  const renderAccountView = () => (
    <>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-6 px-4 py-2">
          {renderBackButton()}
          <h1 className="text-xl font-bold">{t.settings.account}</h1>
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {/* Username */}
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{t.settings.username}</p>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUsernameForm(!showUsernameForm)}
            >
              {t.common.edit}
            </Button>
          </div>
          
          {showUsernameForm && (
            <div className="mt-4 space-y-3">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.settings.usernamePlaceholder}
                className="max-w-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleUsernameSave}
                  disabled={isSaving || !username.trim() || username === user?.username}
                  size="sm"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t.common.save}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowUsernameForm(false);
                    setUsername(user?.username || '');
                  }}
                >
                  {t.common.cancel}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="p-4">
          <p className="font-medium">{t.settings.email}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>

        {/* Created date */}
        <div className="p-4">
          <p className="font-medium">{t.settings.createDate}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(user?.created_at || '').toLocaleDateString(
              language === 'zh' ? 'zh-CN' : 'en-US',
              { year: 'numeric', month: 'long', day: 'numeric' }
            )}
          </p>
        </div>
      </div>
    </>
  );

  const renderSecurityView = () => (
    <>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-6 px-4 py-2">
          {renderBackButton()}
          <h1 className="text-xl font-bold">{t.settings.security}</h1>
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {/* Change Password */}
        <div className="p-4">
          <p className="font-medium">{t.settings.changePassword}</p>
          <p className="text-sm text-muted-foreground mb-4">{t.settings.changePasswordDesc}</p>
          
          <div className="space-y-3 max-w-sm">
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t.settings.currentPassword}
            />
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t.settings.newPassword}
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.settings.confirmPassword}
            />
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
            <Button
              onClick={handlePasswordChange}
              disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t.common.save}
            </Button>
          </div>
        </div>

        {/* Two Factor */}
        <div className="p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{t.settings.twoFactor}</p>
            <p className="text-sm text-muted-foreground">{t.settings.twoFactorDesc}</p>
          </div>
          <span className="text-sm text-muted-foreground">{t.settings.twoFactorDisabled}</span>
        </div>

        {/* Sessions */}
        <button className="w-full p-4 flex justify-between items-center hover:bg-accent/30 transition-colors text-left">
          <div>
            <p className="font-medium">{t.settings.sessions}</p>
            <p className="text-sm text-muted-foreground">{t.settings.sessionsDesc}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </>
  );

  const renderPrivacyView = () => (
    <>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-6 px-4 py-2">
          {renderBackButton()}
          <h1 className="text-xl font-bold">{t.settings.privacy}</h1>
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {/* Private Account */}
        <div className="p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{t.settings.privateAccount}</p>
            <p className="text-sm text-muted-foreground">{t.settings.privateAccountDesc}</p>
          </div>
          <button
            onClick={() => saveSettings({ privateAccount: !settings.privateAccount })}
            className={`w-12 h-7 rounded-full transition-colors ${
              settings.privateAccount ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.privateAccount ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Direct Messages */}
        <div className="p-4">
          <p className="font-medium">{t.settings.allowDM}</p>
          <p className="text-sm text-muted-foreground mb-3">{t.settings.allowDMDesc}</p>
          <div className="space-y-2">
            {(['everyone', 'following', 'noone'] as const).map((option) => (
              <button
                key={option}
                onClick={() => saveSettings({ allowDM: option })}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 transition-colors"
              >
                <span>{t.settings[option === 'noone' ? 'noOne' : option]}</span>
                {settings.allowDM === option && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Blocked Accounts */}
        <button className="w-full p-4 flex justify-between items-center hover:bg-accent/30 transition-colors text-left">
          <div>
            <p className="font-medium">{t.settings.blockedAccounts}</p>
            <p className="text-sm text-muted-foreground">{t.settings.blockedDesc}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Muted Accounts */}
        <button className="w-full p-4 flex justify-between items-center hover:bg-accent/30 transition-colors text-left">
          <div>
            <p className="font-medium">{t.settings.mutedAccounts}</p>
            <p className="text-sm text-muted-foreground">{t.settings.mutedDesc}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </>
  );

  const renderNotificationsView = () => (
    <>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-6 px-4 py-2">
          {renderBackButton()}
          <h1 className="text-xl font-bold">{t.settings.notifications}</h1>
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {/* Push Notifications */}
        <div className="p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{t.settings.pushNotifications}</p>
            <p className="text-sm text-muted-foreground">{t.settings.pushDesc}</p>
          </div>
          <button
            onClick={() => saveSettings({ pushNotifications: !settings.pushNotifications })}
            className={`w-12 h-7 rounded-full transition-colors ${
              settings.pushNotifications ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Email Notifications */}
        <div className="p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{t.settings.emailNotifications}</p>
            <p className="text-sm text-muted-foreground">{t.settings.emailDesc}</p>
          </div>
          <button
            onClick={() => saveSettings({ emailNotifications: !settings.emailNotifications })}
            className={`w-12 h-7 rounded-full transition-colors ${
              settings.emailNotifications ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="p-4 text-sm font-medium text-muted-foreground">
          {language === 'zh' ? '通知类型' : 'Notification types'}
        </div>

        {/* Notify Likes */}
        <div className="p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{t.settings.notifyLikes}</p>
            <p className="text-sm text-muted-foreground">{t.settings.notifyLikesDesc}</p>
          </div>
          <button
            onClick={() => saveSettings({ notifyLikes: !settings.notifyLikes })}
            className={`w-12 h-7 rounded-full transition-colors ${
              settings.notifyLikes ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.notifyLikes ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Notify Retweets */}
        <div className="p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{t.settings.notifyRetweets}</p>
            <p className="text-sm text-muted-foreground">{t.settings.notifyRetweetsDesc}</p>
          </div>
          <button
            onClick={() => saveSettings({ notifyRetweets: !settings.notifyRetweets })}
            className={`w-12 h-7 rounded-full transition-colors ${
              settings.notifyRetweets ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.notifyRetweets ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Notify Mentions */}
        <div className="p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{t.settings.notifyMentions}</p>
            <p className="text-sm text-muted-foreground">{t.settings.notifyMentionsDesc}</p>
          </div>
          <button
            onClick={() => saveSettings({ notifyMentions: !settings.notifyMentions })}
            className={`w-12 h-7 rounded-full transition-colors ${
              settings.notifyMentions ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.notifyMentions ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Notify Follows */}
        <div className="p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{t.settings.notifyFollows}</p>
            <p className="text-sm text-muted-foreground">{t.settings.notifyFollowsDesc}</p>
          </div>
          <button
            onClick={() => saveSettings({ notifyFollows: !settings.notifyFollows })}
            className={`w-12 h-7 rounded-full transition-colors ${
              settings.notifyFollows ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.notifyFollows ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </>
  );

  const renderDisplayView = () => (
    <>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-6 px-4 py-2">
          {renderBackButton()}
          <h1 className="text-xl font-bold">{t.settings.display}</h1>
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {/* Theme */}
        <div className="p-4">
          <p className="font-medium mb-1">{t.settings.theme}</p>
          <p className="text-sm text-muted-foreground mb-3">{t.settings.themeDesc}</p>
          <div className="flex gap-2">
            {[
              { value: 'light', icon: Sun, label: t.settings.themeLight },
              { value: 'dark', icon: Moon, label: t.settings.themeDark },
              { value: 'system', icon: Monitor, label: t.settings.themeSystem },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => saveSettings({ theme: value as 'light' | 'dark' | 'system' })}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${
                  settings.theme === value
                    ? 'border-primary bg-primary/10'
                    : 'border-border/50 hover:bg-accent/30'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="p-4">
          <p className="font-medium mb-1">{t.settings.fontSize}</p>
          <p className="text-sm text-muted-foreground mb-3">{t.settings.fontSizeDesc}</p>
          <div className="flex gap-2">
            <button
              onClick={() => saveSettings({ fontSize: 'small' })}
              className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                settings.fontSize === 'small'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent/30'
              }`}
            >
              {t.settings.fontSizeSmall}
            </button>
            <button
              onClick={() => saveSettings({ fontSize: 'medium' })}
              className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                settings.fontSize === 'medium'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent/30'
              }`}
            >
              {t.settings.fontSizeMedium}
            </button>
            <button
              onClick={() => saveSettings({ fontSize: 'large' })}
              className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                settings.fontSize === 'large'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent/30'
              }`}
            >
              {t.settings.fontSizeLarge}
            </button>
            <button
              onClick={() => saveSettings({ fontSize: 'xlarge' })}
              className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                settings.fontSize === 'xlarge'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-accent/30'
              }`}
            >
              {t.settings.fontSizeXLarge}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderLanguageView = () => (
    <>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-6 px-4 py-2">
          {renderBackButton()}
          <h1 className="text-xl font-bold">{t.settings.language}</h1>
        </div>
      </div>

      <div className="p-4 border-b border-border/50">
        <p className="text-muted-foreground text-[15px]">{t.settings.languageDesc}</p>
      </div>

      <div className="divide-y divide-border/50">
        <button
          onClick={() => handleLanguageChange('zh')}
          className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition-colors"
        >
          <span className="text-[15px]">{t.settings.chinese}</span>
          {language === 'zh' && <Check className="w-5 h-5 text-primary" />}
        </button>
        <button
          onClick={() => handleLanguageChange('en')}
          className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition-colors"
        >
          <span className="text-[15px]">{t.settings.english}</span>
          {language === 'en' && <Check className="w-5 h-5 text-primary" />}
        </button>
      </div>
    </>
  );

  const renderDataView = () => (
    <>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-6 px-4 py-2">
          {renderBackButton()}
          <h1 className="text-xl font-bold">{t.settings.data}</h1>
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {/* Download Data */}
        <div className="p-4">
          <div className="flex items-start gap-4">
            <Download className="w-5 h-5 mt-1 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">{t.settings.downloadData}</p>
              <p className="text-sm text-muted-foreground mb-3">{t.settings.downloadDataDesc}</p>
              <Button variant="outline" size="sm">
                {t.settings.downloadButton}
              </Button>
            </div>
          </div>
        </div>

        {/* Delete Account */}
        <div className="p-4">
          <div className="flex items-start gap-4">
            <Trash2 className="w-5 h-5 mt-1 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">{t.settings.deleteAccount}</p>
              <p className="text-sm text-muted-foreground mb-3">{t.settings.deleteAccountDesc}</p>
              
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  {t.settings.deleteButton}
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-destructive">{t.settings.deleteWarning}</p>
                  <Input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder={t.settings.deleteConfirm}
                    className="max-w-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAccount}
                      disabled={isSaving || deleteConfirm !== user?.username}
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : t.settings.deleteButton}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirm('');
                      }}
                    >
                      {t.common.cancel}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderAboutView = () => (
    <>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-6 px-4 py-2">
          {renderBackButton()}
          <h1 className="text-xl font-bold">{t.settings.aboutTitle}</h1>
        </div>
      </div>

      <div className="divide-y divide-border/50">
        <div className="p-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-primary-foreground">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-xl">X Clone</p>
              <p className="text-sm text-muted-foreground">{t.settings.version} 1.0.0</p>
            </div>
          </div>
        </div>

        <a href="#" className="block p-4 hover:bg-accent/30 transition-colors">
          <p className="text-[15px]">{t.settings.termsOfService}</p>
        </a>
        <a href="#" className="block p-4 hover:bg-accent/30 transition-colors">
          <p className="text-[15px]">{t.settings.privacyPolicy}</p>
        </a>
        <a href="#" className="block p-4 hover:bg-accent/30 transition-colors">
          <p className="text-[15px]">{t.settings.cookiePolicy}</p>
        </a>
        <a href="#" className="block p-4 hover:bg-accent/30 transition-colors">
          <p className="text-[15px]">{t.settings.openSource}</p>
        </a>

        <div className="p-4 text-center text-sm text-muted-foreground">
          © 2024 X Clone. {language === 'zh' ? '保留所有权利。' : 'All rights reserved.'}
        </div>
      </div>
    </>
  );

  const renderView = () => {
    switch (view) {
      case 'account':
        return renderAccountView();
      case 'security':
        return renderSecurityView();
      case 'privacy':
        return renderPrivacyView();
      case 'notifications':
        return renderNotificationsView();
      case 'display':
        return renderDisplayView();
      case 'language':
        return renderLanguageView();
      case 'data':
        return renderDataView();
      case 'about':
        return renderAboutView();
      default:
        return renderMainView();
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="flex justify-center max-w-[1300px] mx-auto">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 min-w-0 max-w-[600px] border-x border-border/50 min-h-screen">
          {renderView()}
        </div>
        <RightSidebar />
      </div>
    </main>
  );
}
