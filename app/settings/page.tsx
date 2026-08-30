'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, User, Mail, Lock, Target, Calendar, Globe, Moon, Sun,
  Bell, Volume2, Eye, Download, Upload, Trash2, Save, Camera,
  Clock, BookOpen, Headphones, PenLine, Mic, Shield, Palette,
  RotateCcw, FileJson, AlertCircle, CheckCircle
} from 'lucide-react';
import { useAuth } from '@/components/auth/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SettingsData {
  // Profile
  name: string;
  email: string;
  avatar: string;
  targetBand: string;
  examDate: string;
  examType: string;
  
  // Preferences
  language: string;
  theme: string;
  notifications: boolean;
  soundEffects: boolean;
  autoPlayAudio: boolean;
  compactMode: boolean;
  
  // Study
  dailyGoalMinutes: string;
  focusSkills: string[];
  currentLevel: string;
  
  // Privacy
  showProfile: boolean;
  showProgress: boolean;
}

const STORAGE_KEY = 'ieltspro_settings';

const defaultSettings: SettingsData = {
  name: '',
  email: '',
  avatar: '',
  targetBand: '7.0',
  examDate: '',
  examType: 'academic',
  language: 'en',
  theme: 'system',
  notifications: true,
  soundEffects: true,
  autoPlayAudio: true,
  compactMode: false,
  dailyGoalMinutes: '60',
  focusSkills: ['reading', 'listening'],
  currentLevel: 'intermediate',
  showProfile: true,
  showProgress: true,
};

function getSettings(): SettingsData {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch {}
  return defaultSettings;
}

function saveSettings(settings: SettingsData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = getSettings();
    if (user) {
      stored.name = user.name || stored.name;
      stored.email = user.email || stored.email;
    }
    // Sync with onboarding data
    const targetBand = localStorage.getItem('ieltspro_target_band');
    const examType = localStorage.getItem('ieltspro_exam_type');
    const focusSkills = localStorage.getItem('ieltspro_focus_skills');
    const currentLevel = localStorage.getItem('ieltspro_current_level');
    const examDate = localStorage.getItem('ieltspro_exam_date');
    if (targetBand) stored.targetBand = targetBand;
    if (examType) stored.examType = examType;
    if (focusSkills) stored.focusSkills = JSON.parse(focusSkills);
    if (currentLevel) stored.currentLevel = currentLevel;
    if (examDate) stored.examDate = examDate;
    setSettings(stored);
  }, [user]);

  const update = (partial: Partial<SettingsData>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const handleSave = () => {
    saveSettings(settings);
    // Sync back to onboarding storage
    localStorage.setItem('ieltspro_target_band', settings.targetBand);
    localStorage.setItem('ieltspro_exam_type', settings.examType);
    localStorage.setItem('ieltspro_focus_skills', JSON.stringify(settings.focusSkills));
    localStorage.setItem('ieltspro_current_level', settings.currentLevel);
    if (settings.examDate) localStorage.setItem('ieltspro_exam_date', settings.examDate);
    if (settings.name) {
      const profile = JSON.parse(localStorage.getItem('ieltspro_user_profile') || '{}');
      profile.name = settings.name;
      localStorage.setItem('ieltspro_user_profile', JSON.stringify(profile));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      update({ avatar: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleExportJSON = () => {
    const allData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('ieltspro_')) {
        try {
          allData[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          allData[key] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `startielts-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        });
        window.location.reload();
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleResetAll = () => {
    if (confirm('Barcha ma\'lumotlar o\'chiriladi. Davom etasizmi?')) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('ieltspro_')) localStorage.removeItem(key);
      });
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'study', label: 'Study', icon: BookOpen },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'data', label: 'Data & Backup', icon: FileJson },
  ];

  const skillOptions = [
    { id: 'reading', label: '📖 Reading' },
    { id: 'listening', label: '🎧 Listening' },
    { id: 'writing', label: '✍️ Writing' },
    { id: 'speaking', label: '🎤 Speaking' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Dashboard</span>
          </Link>
          <div className="mx-auto flex items-center gap-2">
            <span className="font-bold">Settings</span>
          </div>
          <Button size="sm" onClick={handleSave}>
            {saved ? <CheckCircle className="mr-1 h-4 w-4" /> : <Save className="mr-1 h-4 w-4" />}
            {saved ? 'Saved!' : 'Save'}
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Sidebar tabs */}
          <div className="w-full shrink-0 md:w-48">
            <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <>
                {/* Avatar */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold">Profile Photo</h3>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="relative">
                      <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-border bg-muted">
                        {settings.avatar ? (
                          <img src={settings.avatar} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                            {settings.name?.charAt(0) || user?.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                      >
                        <Camera className="h-3.5 w-3.5" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{settings.name || 'Student'}</p>
                      <p className="text-sm text-muted-foreground">{settings.email}</p>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold">Personal Information</h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input value={settings.name} onChange={e => update({ name: e.target.value })} placeholder="Your name" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={settings.email} disabled className="opacity-60" />
                      <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                  </div>
                </div>

                {/* Exam Settings */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold">Exam Settings</h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Target Band Score</Label>
                      <select
                        value={settings.targetBand}
                        onChange={e => update({ targetBand: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        {['5.0','5.5','6.0','6.5','7.0','7.5','8.0','8.5','9.0'].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Exam Type</Label>
                      <select
                        value={settings.examType}
                        onChange={e => update({ examType: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="academic">Academic</option>
                        <option value="general">General Training</option>
                      </select>
                    </div>
                    <div>
                      <Label>Exam Date</Label>
                      <Input
                        type="date"
                        value={settings.examDate}
                        onChange={e => update({ examDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label>Current Level</Label>
                      <select
                        value={settings.currentLevel}
                        onChange={e => update({ currentLevel: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="beginner">Beginner (A1-A2)</option>
                        <option value="intermediate">Intermediate (B1-B2)</option>
                        <option value="upper-intermediate">Upper Intermediate (B2+)</option>
                        <option value="advanced">Advanced (C1-C2)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Study Tab */}
            {activeTab === 'study' && (
              <>
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold">Focus Skills</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Select which skills you want to focus on</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {skillOptions.map(skill => (
                      <button
                        key={skill.id}
                        onClick={() => {
                          const skills = settings.focusSkills.includes(skill.id)
                            ? settings.focusSkills.filter(s => s !== skill.id)
                            : [...settings.focusSkills, skill.id];
                          update({ focusSkills: skills });
                        }}
                        className={cn(
                          'rounded-lg border-2 p-3 text-left text-sm transition-all',
                          settings.focusSkills.includes(skill.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        {skill.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold">Daily Study Goal</h3>
                  <div className="mt-4">
                    <Label>Minutes per day</Label>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {['15','30','60','120'].map(mins => (
                        <button
                          key={mins}
                          onClick={() => update({ dailyGoalMinutes: mins })}
                          className={cn(
                            'rounded-lg border-2 p-2 text-center text-sm font-medium transition-all',
                            settings.dailyGoalMinutes === mins
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          {mins} min
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold">Audio Settings</h3>
                  <div className="mt-4 space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm">Auto-play audio in Listening tests</span>
                      <input
                        type="checkbox"
                        checked={settings.autoPlayAudio}
                        onChange={e => update({ autoPlayAudio: e.target.checked })}
                        className="h-5 w-5 rounded accent-primary"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm">Sound effects</span>
                      <input
                        type="checkbox"
                        checked={settings.soundEffects}
                        onChange={e => update({ soundEffects: e.target.checked })}
                        className="h-5 w-5 rounded accent-primary"
                      />
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <>
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold">Theme</h3>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                      { id: 'system', label: 'System', icon: Palette },
                    ].map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          update({ theme: theme.id });
                          document.documentElement.classList.toggle('dark', theme.id === 'dark');
                        }}
                        className={cn(
                          'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                          settings.theme === theme.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <theme.icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold">Language</h3>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { id: 'en', label: 'English', flag: '🇺🇸' },
                      { id: 'uz', label: 'O\'zbek', flag: '🇺🇿' },
                      { id: 'ru', label: 'Русский', flag: '🇷🇺' },
                    ].map(lang => (
                      <button
                        key={lang.id}
                        onClick={() => update({ language: lang.id })}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border-2 p-3 transition-all',
                          settings.language === lang.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="text-sm font-medium">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold">Display</h3>
                  <div className="mt-4 space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm">Compact mode</span>
                      <input
                        type="checkbox"
                        checked={settings.compactMode}
                        onChange={e => update({ compactMode: e.target.checked })}
                        className="h-5 w-5 rounded accent-primary"
                      />
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold">Notification Preferences</h3>
                <div className="mt-4 space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive reminders and updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={e => update({ notifications: e.target.checked })}
                      className="h-5 w-5 rounded accent-primary"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Daily Study Reminder</p>
                      <p className="text-xs text-muted-foreground">Get reminded to study every day</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5 rounded accent-primary" />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Streak Alerts</p>
                      <p className="text-xs text-muted-foreground">Notifications when your streak is at risk</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5 rounded accent-primary" />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Subscription Expiry</p>
                      <p className="text-xs text-muted-foreground">Reminders before your plan expires</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-5 w-5 rounded accent-primary" />
                  </label>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <>
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold">Privacy Settings</h3>
                  <div className="mt-4 space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Show profile to others</p>
                        <p className="text-xs text-muted-foreground">Allow others to see your profile</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.showProfile}
                        onChange={e => update({ showProfile: e.target.checked })}
                        className="h-5 w-5 rounded accent-primary"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Show progress publicly</p>
                        <p className="text-xs text-muted-foreground">Display your progress on leaderboard</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.showProgress}
                        onChange={e => update({ showProgress: e.target.checked })}
                        className="h-5 w-5 rounded accent-primary"
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
                  <h3 className="font-semibold text-destructive">Danger Zone</h3>
                  <div className="mt-4 space-y-3">
                    <Button variant="outline" onClick={() => signOut()}>
                      <Lock className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                    <Button variant="destructive" onClick={handleResetAll}>
                      <Trash2 className="mr-2 h-4 w-4" /> Reset All Data
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Data & Backup Tab */}
            {activeTab === 'data' && (
              <>
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold">Export Data (JSON Backup)</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Download all your data as a JSON file for backup
                  </p>
                  <Button className="mt-4" onClick={handleExportJSON}>
                    <Download className="mr-2 h-4 w-4" /> Export JSON
                  </Button>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold">Import Data</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Restore your data from a JSON backup file
                  </p>
                  <div className="mt-4">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted">
                      <Upload className="h-4 w-4" />
                      Choose JSON file
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleImportJSON}
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold">Stored Data</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Overview of locally stored data</p>
                  <div className="mt-4 space-y-2">
                    {[
                      { key: 'ieltspro_user_profile', label: 'User Profile' },
                      { key: 'ieltspro_test_results', label: 'Test Results' },
                      { key: 'ieltspro_vocabulary', label: 'Vocabulary' },
                      { key: 'ieltspro_streak', label: 'Streak Data' },
                      { key: 'ieltspro_achievements', label: 'Achievements' },
                      { key: 'ieltspro_daily_goals', label: 'Daily Goals' },
                      { key: 'ieltspro_notifications', label: 'Notifications' },
                      { key: 'ieltspro_settings', label: 'Settings' },
                      { key: 'ieltspro_mock_sessions', label: 'Mock Exam Sessions' },
                    ].map(item => {
                      const exists = typeof window !== 'undefined' && localStorage.getItem(item.key) !== null;
                      return (
                        <div key={item.key} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                          <span className="text-sm">{item.label}</span>
                          <span className={cn('text-xs font-medium', exists ? 'text-green-600' : 'text-muted-foreground')}>
                            {exists ? '✓ Saved' : '— Empty'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
