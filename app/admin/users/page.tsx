'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Users as UsersIcon,
  Crown,
  Shield,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  GraduationCap,
  Wallet,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  role: string;
  target_band: number | null;
  created_at: string;
}

interface SubRow {
  user_id: string;
  tier: string;
  status: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [subs, setSubs] = useState<Record<string, SubRow>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState('');
  const [actionRole, setActionRole] = useState('teacher');
  const [actionTier, setActionTier] = useState('basic');
  const pageSize = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,full_name.ilike.%${search}%,id.ilike.%${search}%`
      );
    }

    const { data, count } = await query;

    if (data) {
      const userIds = data.map((u) => u.id);
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('user_id, tier, status')
        .in('user_id', userIds);

      const subMap: Record<string, SubRow> = {};
      (subData || []).forEach((s) => {
        subMap[s.user_id] = s as SubRow;
      });

      setUsers(data as ProfileRow[]);
      setSubs(subMap);
      setTotal(count || 0);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchUsers();
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  const changeRole = async (userId: string, newRole: string) => {
    setError(null);
    const { error: rpcError } = await supabase.rpc('admin_set_user_role', {
      p_target_user: userId,
      p_role: newRole,
    });
    if (rpcError) {
      setError('Could not update user role.');
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    }
  };

  const changeTier = async (userId: string, newTier: string) => {
    setError(null);
    const { error: rpcError } = await supabase.rpc('admin_set_subscription_tier', {
      p_target_user: userId,
      p_tier: newTier,
    });
    if (rpcError) {
      setError('Could not update subscription.');
    } else {
      setSubs((prev) => ({
        ...prev,
        [userId]: { user_id: userId, tier: newTier, status: 'active' },
      }));
    }
  };

  // Look up a single user by exact/partial ID; returns their uuid or null
  const lookupUserId = async (term: string): Promise<string | null> => {
    setError(null);
    if (!term.trim()) {
      setError('Please paste a user ID first.');
      return null;
    }
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, target_band, created_at')
      .ilike('id', `%${term.trim()}%`)
      .limit(2);
    if (fetchError || !data?.length) {
      setError(`No user found for ID “${term.trim()}”.`);
      return null;
    }
    if (data.length > 1) {
      setError('This ID matches multiple users. Paste the full ID.');
      return null;
    }
    const found = data[0] as ProfileRow;
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('user_id, tier, status')
      .eq('user_id', found.id)
      .maybeSingle();
    if (subData) {
      setSubs((prev) => ({
        ...prev,
        [found.id]: subData as SubRow,
      }));
    }
    // Focus the table on this user
    setSearch(found.id);
    setPage(0);
    setUsers([found]);
    setTotal(1);
    return found.id;
  };

  const handleIdRole = async () => {
    const id = await lookupUserId(actionId);
    if (id) await changeRole(id, actionRole);
  };

  const handleIdTier = async () => {
    const id = await lookupUserId(actionId);
    if (id) await changeTier(id, actionTier);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View all users, manage roles and subscription tiers.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email or user ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Quick actions by user ID */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium">Quick actions by user ID</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Paste the ID the user shows in their profile (Settings → Profile → Your ID).
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="User ID..."
            value={actionId}
            onChange={(e) => setActionId(e.target.value)}
            className="font-mono text-xs sm:flex-1"
          />
          <select
            value={actionRole}
            onChange={(e) => setActionRole(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-2 text-xs font-medium"
          >
            <option value="student">Role: Student</option>
            <option value="teacher">Role: Teacher</option>
            <option value="admin">Role: Admin</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 whitespace-nowrap"
            onClick={handleIdRole}
          >
            <GraduationCap className="h-4 w-4" />
            Set role
          </Button>
          <select
            value={actionTier}
            onChange={(e) => setActionTier(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-2 text-xs font-medium"
          >
            <option value="free">Tier: Free</option>
            <option value="daily">Tier: Daily Pass</option>
            <option value="start">Tier: Start</option>
            <option value="basic">Tier: Basic</option>
            <option value="pro">Tier: Pro</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 whitespace-nowrap"
            onClick={handleIdTier}
          >
            <Wallet className="h-4 w-4" />
            Set tier
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <UsersIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-xl font-bold">{total}</div>
            <div className="text-xs text-muted-foreground">Total users</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
            <Crown className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="text-xl font-bold">
              {Object.values(subs).filter((s) => s.tier !== 'free' && s.status === 'active').length}
            </div>
            <div className="text-xs text-muted-foreground">Premium (this page)</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
            <Shield className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="text-xl font-bold">
              {users.filter((u) => u.role === 'admin').length}
            </div>
            <div className="text-xs text-muted-foreground">Admins (this page)</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subscription</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Target</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const sub = subs[user.id];
                  return (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-bold">
                            {(user.full_name || user.email || '?')[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {user.full_name || 'Unnamed'}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                            <div
                              className="mt-0.5 cursor-pointer font-mono text-[10px] text-muted-foreground/70 hover:text-foreground"
                              title="Click to copy full ID"
                              onClick={() => navigator.clipboard?.writeText(user.id).catch(() => {})}
                            >
                              ID: {user.id.slice(0, 8)}…{user.id.slice(-4)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(e) => changeRole(user.id, e.target.value)}
                          className="rounded-md border border-input bg-background px-2 py-1 text-xs font-medium capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={sub?.tier || 'free'}
                          onChange={(e) => changeTier(user.id, e.target.value)}
                          className={cn(
                            'rounded-md border border-input bg-background px-2 py-1 text-xs font-medium capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            (sub?.tier || 'free') !== 'free' && 'border-amber-300'
                          )}
                          title="Manually set subscription tier"
                        >
                          <option value="free">Free</option>
                          <option value="daily">Daily Pass</option>
                          <option value="start">Start</option>
                          <option value="basic">Basic</option>
                          <option value="pro">Pro</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {user.target_band ? user.target_band.toFixed(1) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {total > pageSize && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
