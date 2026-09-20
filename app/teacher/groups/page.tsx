'use client';

import { useState, useEffect } from 'react';
import {
  PlusCircle, Trash2, Users, UserPlus, UserMinus, ChevronDown, ChevronUp,
  Edit2, Check, X, Mail, Search, Folder
} from 'lucide-react';
import { useAuth } from '@/components/auth/use-auth';
import {
  getGroupsByTeacher, createGroup, updateGroup, deleteGroup,
  addStudentToGroup, removeStudentFromGroup,
  type StudentGroup
} from '@/lib/teacher-test-store';
import { cn } from '@/lib/utils';

const groupColors = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500',
];

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(groupColors[0]);
  const [addEmail, setAddEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) setGroups(getGroupsByTeacher(user.email));
  }, [user]);

  const refresh = () => {
    if (user) setGroups(getGroupsByTeacher(user.email));
  };

  const handleCreate = () => {
    if (!newGroupName.trim()) return;
    createGroup({
      name: newGroupName.trim(),
      description: newGroupDesc.trim(),
      studentEmails: [],
      createdBy: user?.email || '',
      color: newGroupColor,
    });
    setNewGroupName('');
    setNewGroupDesc('');
    setShowCreate(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this group?')) {
      deleteGroup(id);
      refresh();
    }
  };

  const handleAddStudent = (groupId: string) => {
    if (!addEmail.trim()) return;
    addStudentToGroup(groupId, addEmail.trim().toLowerCase());
    setAddEmail('');
    refresh();
  };

  const handleRemoveStudent = (groupId: string, email: string) => {
    removeStudentFromGroup(groupId, email);
    refresh();
  };

  const totalStudents = groups.reduce((sum, g) => sum + g.studentEmails.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Groups</h1>
          <p className="mt-1 text-sm text-muted-foreground">Organize your students into groups for test assignment.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          New Group
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Groups</p>
              <p className="mt-1 text-2xl font-bold">{groups.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Folder className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Students</p>
              <p className="mt-1 text-2xl font-bold">{totalStudents}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Avg per Group</p>
              <p className="mt-1 text-2xl font-bold">{groups.length > 0 ? Math.round(totalStudents / groups.length) : 0}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <UserPlus className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-2xl border border-primary/30 bg-card p-6 space-y-4">
          <h2 className="text-lg font-bold">Create New Group</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Group Name *</label>
              <input
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                placeholder="e.g., IELTS Batch 2025-A"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
              <input
                value={newGroupDesc}
                onChange={e => setNewGroupDesc(e.target.value)}
                placeholder="Brief description..."
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color</label>
            <div className="mt-2 flex gap-2">
              {groupColors.map(color => (
                <button
                  key={color}
                  onClick={() => setNewGroupColor(color)}
                  className={cn(
                    'h-8 w-8 rounded-full transition-all',
                    color,
                    newGroupColor === color ? 'ring-2 ring-offset-2 ring-primary' : 'opacity-60 hover:opacity-100'
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all"
            >
              Create Group
            </button>
          </div>
        </div>
      )}

      {/* Groups list */}
      {groups.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold">No groups yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create groups to organize students and assign tests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(group => (
            <div key={group.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Group header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => setExpandedId(expandedId === group.id ? null : group.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn('h-3 w-3 rounded-full', group.color)} />
                  <div>
                    <h3 className="text-base font-bold">{group.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {group.description || 'No description'} · {group.studentEmails.length} students
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {group.studentEmails.length}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(group.id); }}
                    className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {expandedId === group.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>

              {/* Expanded: students */}
              {expandedId === group.id && (
                <div className="border-t border-border p-4 space-y-3 bg-muted/10">
                  {/* Add student */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        value={addEmail}
                        onChange={e => setAddEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddStudent(group.id)}
                        placeholder="student@email.com"
                        className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <button
                      onClick={() => handleAddStudent(group.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all"
                    >
                      <UserPlus className="h-4 w-4" />
                      Add
                    </button>
                  </div>

                  {/* Student list */}
                  {group.studentEmails.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No students in this group yet.</p>
                  ) : (
                    <div className="space-y-1">
                      {group.studentEmails.map(email => (
                        <div key={email} className="flex items-center justify-between rounded-lg bg-background px-3 py-2">
                          <span className="text-sm">{email}</span>
                          <button
                            onClick={() => handleRemoveStudent(group.id, email)}
                            className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
                          >
                            <UserMinus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
