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

/**
 * AppSidebar — premium vertical navigation rail.
 *
 * v0-inspired density:
 *   • 248px rail, h-14 brand area
 *   • Groups separated by whitespace (space-y-6), NOT dividers
 *   • Nav items: `rounded-md px-3 py-2 text-sm` with soft hover state
 *   • User footer is a single quiet row — avatar + name/role + signout icon,
 *     no visible inner border
 */
export function AppSidebar({
  userFullName = 'User',
  userEmail    = '',
  systemRole   = null,
}: AppSidebarProps) {
  const pathname = usePathname()
  const perms    = getNavPermissions(systemRole)

  // ── Build nav groups ────────────────────────────────────────

  const mainItems: NavItem[] = [
    { label: perms.labelDashboard, href: '/dashboard', icon: <LayoutDashboard size={16} /> },
  ]

  const operationsItems: NavItem[] = [
    ...(perms.showClients  ? [{ label: 'Clients',      href: '/clients',      icon: <Users size={16} /> }]        : []),
    ...(perms.showIntakes  ? [{ label: 'Intakes',      href: '/intakes',      icon: <ClipboardList size={16} /> }] : []),
    { label: perms.labelProjects,     href: '/projects',     icon: <FolderKanban size={16} /> },
    { label: perms.labelTasks,        href: '/tasks',        icon: <CheckSquare size={16} /> },
    { label: perms.labelDeliverables, href: '/deliverables', icon: <FileText size={16} /> },
    { label: perms.labelFiles,        href: '/files',        icon: <Paperclip size={16} /> },
  ]

  const peopleItems: NavItem[] = [
    ...(perms.showTeam         ? [{ label: 'Team',         href: '/team',         icon: <UserSquare2 size={16} /> }] : []),
    ...(perms.showCompensation ? [{ label: 'Compensation', href: '/compensation', icon: <Receipt size={16} /> }]    : []),
    ...(perms.showPayments     ? [{ label: 'Payments',     href: '/payments',     icon: <Wallet size={16} /> }]     : []),
    ...(perms.showMyPayments   ? [{ label: 'My Payments',  href: '/my-payments',  icon: <Wallet size={16} /> }]     : []),
  ]

  const bottomItems: NavItem[] = [
    ...(perms.showSettings ? [{ label: 'Settings', href: '/settings', icon: <Settings size={16} /> }] : []),
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
            'sidebar-nav-item flex items-center gap-3 rounded-md px-3 py-2 text-sm no-underline transition-colors duration-150',
            active
              ? 'bg-[var(--sidebar-active-bg)] font-semibold text-[var(--sidebar-active-text)]'
              : 'font-medium text-[var(--sidebar-text-muted)]'
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'flex shrink-0',
              active ? 'text-[var(--sidebar-active-text)]' : 'text-[var(--sidebar-text-muted)]'
            )}
          >
            {item.icon}
          </span>
          <span className="truncate">{item.label}</span>
        </Link>
      </li>
    )
  }

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
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--color-primary)] shadow-[0_1px_3px_rgba(20,45,80,0.35)]"
        >
          <span className="text-[12px] font-bold tracking-[0.02em] text-white">R</span>
        </div>
        <div className="min-w-0 leading-tight">
          <span className="block truncate text-[0.9375rem] font-semibold text-[var(--sidebar-text)]">
            Agency OS
          </span>
          <span className="mt-0.5 block truncate text-[0.6875rem] font-medium text-[var(--sidebar-label)]">
            {systemRole ? (ROLE_CONTEXT[systemRole] ?? 'Engineering Agency') : 'Engineering Agency'}
          </span>
        </div>
      </div>

      {/* ── Nav groups ────────────────────────────────────────── */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="mb-2 px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[var(--sidebar-label)]">
                {group.label}
              </p>
            )}
            <ul role="list" className="flex flex-col gap-0.5">
              {group.items.map(renderItem)}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-[var(--sidebar-border)] p-3">
        {/* My Profile */}
        <Link
          href="/my-profile"
          aria-current={profileActive ? 'page' : undefined}
          className={cn(
            'sidebar-nav-item mb-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm no-underline transition-colors duration-150',
            profileActive
              ? 'bg-[var(--sidebar-active-bg)] font-semibold text-[var(--sidebar-active-text)]'
              : 'font-medium text-[var(--sidebar-text-muted)]'
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'flex shrink-0',
              profileActive ? 'text-[var(--sidebar-active-text)]' : 'text-[var(--sidebar-text-muted)]'
            )}
          >
            <UserCircle size={16} />
          </span>
          My Profile
        </Link>

        {/* User card — quiet row, no inner border */}
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-[var(--sidebar-hover)]">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-[var(--color-primary)] text-[10px] text-white">
              {getInitials(userFullName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[0.8125rem] font-semibold text-[var(--sidebar-text)]">
              {userFullName}
            </p>
            {systemRole && (
              <p className="mt-0.5 truncate text-[0.6875rem] font-medium text-[var(--sidebar-text-muted)] capitalize">
                {ROLE_LABEL[systemRole] ?? systemRole}
              </p>
            )}
          </div>

          <form action={logout}>
            <button
              type="submit"
              title="Sign out"
              aria-label="Sign out"
              className="signout-btn flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-[var(--sidebar-text-muted)] transition-colors duration-150"
            >
              <LogOut size={14} aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
