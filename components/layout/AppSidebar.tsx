'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FolderKanban,
  CheckSquare,
  FileText,
  Paperclip,
  UserSquare2,
  Receipt,
  Wallet,
  Settings,
  LogOut,
  UserCircle,
} from 'lucide-react'
import { logout } from '@/app/auth/login/actions'
import { getInitials } from '@/lib/utils/formatters'
import { getNavPermissions } from '@/lib/auth/permissions'
import { cn } from '@/lib/utils/cn'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { SystemRole } from '@/types/database'

// ── Role display helpers ──────────────────────────────────────────────────

const ROLE_CONTEXT: Record<string, string> = {
  admin:       'Admin Workspace',
  coordinator: 'Coordinator',
  reviewer:    'Review Queue',
  member:      'My Workspace',
}

const ROLE_LABEL: Record<string, string> = {
  admin:       'Admin',
  coordinator: 'Coordinator',
  reviewer:    'Reviewer',
  member:      'Member',
}

interface NavItem {
  label: string
  href:  string
  icon:  React.ReactNode
}

interface NavGroup {
  label?: string
  items:  NavItem[]
}

interface AppSidebarProps {
  userFullName?: string
  userEmail?:    string
  systemRole?:   SystemRole | null
}

export function AppSidebar({
  userFullName = 'User',
  userEmail    = '',
  systemRole   = null,
}: AppSidebarProps) {
  const pathname = usePathname()
  const perms    = getNavPermissions(systemRole)

  // ── Build nav groups ────────────────────────────────────────

  const mainItems: NavItem[] = [
    { label: perms.labelDashboard, href: '/dashboard', icon: <LayoutDashboard size={15} /> },
  ]

  const operationsItems: NavItem[] = [
    ...(perms.showClients  ? [{ label: 'Clients',      href: '/clients',      icon: <Users size={15} /> }]        : []),
    ...(perms.showIntakes  ? [{ label: 'Intakes',      href: '/intakes',      icon: <ClipboardList size={15} /> }] : []),
    { label: perms.labelProjects,     href: '/projects',     icon: <FolderKanban size={15} /> },
    { label: perms.labelTasks,        href: '/tasks',        icon: <CheckSquare size={15} /> },
    { label: perms.labelDeliverables, href: '/deliverables', icon: <FileText size={15} /> },
    { label: perms.labelFiles,        href: '/files',        icon: <Paperclip size={15} /> },
  ]

  const peopleItems: NavItem[] = [
    ...(perms.showTeam         ? [{ label: 'Team',         href: '/team',         icon: <UserSquare2 size={15} /> }] : []),
    ...(perms.showCompensation ? [{ label: 'Compensation', href: '/compensation', icon: <Receipt size={15} /> }]    : []),
    ...(perms.showPayments     ? [{ label: 'Payments',     href: '/payments',     icon: <Wallet size={15} /> }]     : []),
    ...(perms.showMyPayments   ? [{ label: 'My Payments',  href: '/my-payments',  icon: <Wallet size={15} /> }]     : []),
  ]

  const bottomItems: NavItem[] = [
    ...(perms.showSettings ? [{ label: 'Settings', href: '/settings', icon: <Settings size={15} /> }] : []),
  ]

  const navGroups: NavGroup[] = [
    { items: mainItems },
    { label: 'Operations',  items: operationsItems },
    ...(peopleItems.length  ? [{ label: 'People',     items: peopleItems }]  : []),
    ...(bottomItems.length  ? [{ label: 'Admin',      items: bottomItems }]  : []),
  ]

  // ── Nav item renderer ───────────────────────────────────────

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href)
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'sidebar-nav-item flex items-center gap-2.5 rounded-[7px] px-2.5 py-1.5 text-[0.8125rem] no-underline transition-colors duration-[120ms]',
            active
              ? 'bg-[var(--sidebar-active-bg)] font-semibold text-[var(--sidebar-active-text)]'
              : 'font-normal text-[var(--sidebar-text-muted)]'
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'flex shrink-0 transition-colors duration-[120ms]',
              active ? 'text-[var(--sidebar-active-text)]' : 'text-[var(--sidebar-text-muted)]'
            )}
          >
            {item.icon}
          </span>
          {item.label}
        </Link>
      </li>
    )
  }

  // ── My Profile link ─────────────────────────────────────────

  const profileActive = pathname === '/my-profile'

  // ── Render ──────────────────────────────────────────────────

  return (
    <aside
      className="sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]"
      style={{ width: 'var(--sidebar-width)', minWidth: 'var(--sidebar-width)' }}
    >
      {/* ── Brand ─────────────────────────────────────────────── */}
      <div
        className="flex shrink-0 items-center gap-2.5 border-b border-[var(--sidebar-border)] px-4"
        style={{ height: 'var(--topbar-height)' }}
      >
        <div
          aria-hidden="true"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[var(--color-primary)] shadow-[0_1px_3px_rgba(20,45,80,0.25)]"
        >
          <span className="text-[11px] font-bold tracking-[0.02em] text-white">EA</span>
        </div>
        <div className="min-w-0">
          <span className="block truncate text-[0.875rem] font-bold text-[var(--sidebar-text)]">
            Agency OS
          </span>
          <span className="text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-[var(--sidebar-label)]">
            {systemRole ? (ROLE_CONTEXT[systemRole] ?? 'Engineering Agency') : 'Engineering Agency'}
          </span>
        </div>
      </div>

      {/* ── Nav groups ────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto p-2" aria-label="Main navigation">
        {navGroups.map((group, gi) => (
          <div key={gi} className="mb-0.5">
            {group.label && (
              <p className="px-2.5 pb-1 pt-3 text-[0.625rem] font-bold uppercase tracking-[0.07em] text-[var(--sidebar-label)]">
                {group.label}
              </p>
            )}
            <ul role="list" className="flex flex-col gap-px">
              {group.items.map(renderItem)}
            </ul>
            {gi < navGroups.length - 1 && (
              <div className="mx-1 my-1.5 h-px bg-[var(--sidebar-border)] opacity-60" />
            )}
          </div>
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-[var(--sidebar-border)] p-2">
        {/* My Profile */}
        <Link
          href="/my-profile"
          aria-current={profileActive ? 'page' : undefined}
          className={cn(
            'sidebar-nav-item mb-1.5 flex items-center gap-2.5 rounded-[7px] px-2.5 py-1.5 text-[0.8125rem] no-underline transition-colors duration-[120ms]',
            profileActive
              ? 'bg-[var(--sidebar-active-bg)] font-semibold text-[var(--sidebar-active-text)]'
              : 'font-normal text-[var(--sidebar-text-muted)]'
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'flex shrink-0',
              profileActive ? 'text-[var(--sidebar-active-text)]' : 'text-[var(--sidebar-text-muted)]'
            )}
          >
            <UserCircle size={15} />
          </span>
          My Profile
        </Link>

        {/* User card */}
        <div className="flex items-center gap-2.5 rounded-[7px] border border-[var(--sidebar-border)] bg-white/[0.06] px-2.5 py-2">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="text-[10px]">
              {getInitials(userFullName)}
            </AvatarFallback>
          </Avatar>

          {/* Name + role */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[var(--sidebar-text)]">
              {userFullName}
            </p>
            {systemRole && (
              <span className="mt-0.5 inline-flex items-center rounded-full border border-white/[0.16] bg-white/10 px-1.5 py-px text-[0.5625rem] font-bold uppercase tracking-[0.05em] text-[var(--sidebar-text-muted)] whitespace-nowrap">
                {ROLE_LABEL[systemRole] ?? systemRole}
              </span>
            )}
          </div>

          {/* Sign out icon button */}
          <form action={logout}>
            <button
              type="submit"
              title="Sign out"
              aria-label="Sign out"
              className="signout-btn flex h-6.5 w-6.5 shrink-0 cursor-pointer items-center justify-center rounded-[6px] border border-white/[0.14] bg-white/[0.06] text-[var(--sidebar-text-muted)] transition-colors duration-[120ms]"
              style={{ width: '26px', height: '26px' }}
            >
              <LogOut size={12} aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
