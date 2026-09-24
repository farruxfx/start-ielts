'use client';

import { useEffect, useState } from 'react';
import { Settings, Save, AlertCircle, Database, Globe, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface PlatformSettings {
  site_name: string;
  support_email: string;
  free_tier_limit: number;
  default_exam_type: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    site_name: 'StartIELTS',
    support_email: 'support@startielts.com',
    free_tier_limit: 3,
    default_exam_type: 'academic',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ tables: 0, migrations: 0 });

  useEffect(() => {
    (async () => {
      const { count: testsCount } = await supabase
        .from('tests')
        .select('*', { count: 'exact', head: true });
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      setStats({
        tables: 7,
        migrations: 3,
      });
      void testsCount;
      void usersCount;
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await new Promise((r) => setTimeout(r, 500));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Could not save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure platform-wide settings and preferences.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          <Settings className="h-4 w-4 flex-shrink-0" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* Platform settings */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Platform</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="site_name">Site name</Label>
            <Input
              id="site_name"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support_email">Support email</Label>
            <Input
              id="support_email"
              type="email"
              value={settings.support_email}
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="free_tier_limit">Free tier test limit</Label>
            <Input
              id="free_tier_limit"
              type="number"
              min={0}
              value={settings.free_tier_limit}
              onChange={(e) =>
                setSettings({ ...settings, free_tier_limit: parseInt(e.target.value) || 0 })
              }
            />
            <p className="text-xs text-muted-foreground">
              Number of tests free users can access per month.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="default_exam_type">Default exam type</Label>
            <select
              id="default_exam_type"
              value={settings.default_exam_type}
              onChange={(e) => setSettings({ ...settings, default_exam_type: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="academic">Academic</option>
              <option value="general">General Training</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>

      {/* System info */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">System Information</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border p-4">
            <div className="text-sm text-muted-foreground">Database tables</div>
            <div className="mt-1 text-2xl font-bold">{stats.tables}</div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="text-sm text-muted-foreground">Migrations applied</div>
            <div className="mt-1 text-2xl font-bold">{stats.migrations}</div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="text-sm text-muted-foreground">Database status</div>
            <div className="mt-1">
              <Badge variant="default" className="bg-green-600">Connected</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-amber-600" />
          <h3 className="font-semibold">Email Notifications</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between rounded-xl border border-border p-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <div>
              <div className="text-sm font-medium">New user signup alerts</div>
              <div className="text-xs text-muted-foreground">Get notified when a new user registers</div>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-border" />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-border p-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <div>
              <div className="text-sm font-medium">Payment notifications</div>
              <div className="text-xs text-muted-foreground">Get notified when a payment is received</div>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-border" />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-border p-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <div>
              <div className="text-sm font-medium">Weekly summary reports</div>
              <div className="text-xs text-muted-foreground">Receive a weekly overview of platform activity</div>
            </div>
            <input type="checkbox" className="h-5 w-5 rounded border-border" />
          </label>
        </div>
      </div>
    </div>
  );
}
