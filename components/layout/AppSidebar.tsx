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
          className="sidebar-nav-item"
          style={{
            display:         'flex',
            alignItems:      'center',
            gap:             '9px',
            padding:         '6px 10px',
            borderRadius:    '7px',
            fontSize:        '0.8125rem',
            fontWeight:      active ? 600 : 400,
            color:           active ? 'var(--sidebar-active-text)' : 'var(--sidebar-text-muted)',
            backgroundColor: active ? 'var(--sidebar-active-bg)' : 'transparent',
            textDecoration:  'none',
            transition:      'background-color 0.12s, color 0.12s',
          }}
        >
          <span
            style={{
              display:    'flex',
              flexShrink: 0,
              color:      active ? 'var(--sidebar-active-text)' : 'var(--sidebar-text-muted)',
              transition: 'color 0.12s',
            }}
            aria-hidden="true"
          >
            {item.icon}
          </span>
          {item.label}
        </Link>
      </li>
    )
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <aside
      style={{
        width:           'var(--sidebar-width)',
        minWidth:        'var(--sidebar-width)',
        height:          '100vh',
        position:        'sticky',
        top:             0,
        display:         'flex',
        flexDirection:   'column',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight:     '1px solid var(--sidebar-border)',
        overflow:        'hidden',
      }}
    >

      {/* ── Brand ─────────────────────────────────────────────── */}
      <div
        style={{
          height:       'var(--topbar-height)',
          display:      'flex',
          alignItems:   'center',
          gap:          '10px',
          padding:      '0 16px',
          borderBottom: '1px solid var(--sidebar-border)',
          flexShrink:   0,
        }}
      >
        <div
          style={{
            width:           '28px',
            height:          '28px',
            backgroundColor: 'var(--color-primary)',
            borderRadius:    '7px',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            flexShrink:      0,
            boxShadow:       '0 1px 3px rgba(20,45,80,0.25)',
          }}
          aria-hidden="true"
        >
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '11px', letterSpacing: '0.02em' }}>EA</span>
        </div>
        <div style={{ minWidth: 0 }}>
          <span
            style={{
              fontWeight:   700,
              fontSize:     '0.875rem',
              color:        'var(--sidebar-text)',
              whiteSpace:   'nowrap',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              display:      'block',
            }}
          >
            Agency OS
          </span>
          <span
            style={{
              fontSize:      '0.625rem',
              color:         'var(--sidebar-label)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight:    600,
            }}
          >
            {systemRole ? (ROLE_CONTEXT[systemRole] ?? 'Engineering Agency') : 'Engineering Agency'}
          </span>
        </div>
      </div>

      {/* ── Nav groups ────────────────────────────────────────── */}
      <nav
        style={{ flex: 1, padding: '8px', overflowY: 'auto' }}
        aria-label="Main navigation"
      >
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: '2px' }}>

            {/* Group label */}
            {group.label && (
              <p
                style={{
                  fontSize:      '0.625rem',
                  fontWeight:    700,
                  color:         'var(--sidebar-label)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  padding:       '12px 10px 4px',
                }}
              >
                {group.label}
              </p>
            )}

            {/* Items */}
            <ul
              role="list"
              style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1px' }}
            >
              {group.items.map(renderItem)}
            </ul>

            {/* Divider */}
            {gi < navGroups.length - 1 && (
              <div
                style={{
                  height:          '1px',
                  backgroundColor: 'var(--sidebar-border)',
                  margin:          '6px 4px 2px',
                  opacity:         0.6,
                }}
              />
            )}

          </div>
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: '1px solid var(--sidebar-border)',
          padding:   '10px 8px',
          flexShrink: 0,
        }}
      >
        {/* My Profile */}
        <Link
          href="/my-profile"
          aria-current={pathname === '/my-profile' ? 'page' : undefined}
          className="sidebar-nav-item"
          style={{
            display:         'flex',
            alignItems:      'center',
            gap:             '9px',
            padding:         '6px 10px',
            borderRadius:    '7px',
            fontSize:        '0.8125rem',
            fontWeight:      pathname === '/my-profile' ? 600 : 400,
            color:           pathname === '/my-profile' ? 'var(--sidebar-active-text)' : 'var(--sidebar-text-muted)',
            backgroundColor: pathname === '/my-profile' ? 'var(--sidebar-active-bg)' : 'transparent',
            textDecoration:  'none',
            transition:      'background-color 0.12s, color 0.12s',
            marginBottom:    '6px',
          }}
        >
          <span
            style={{
              display:  'flex',
              flexShrink: 0,
              color:    pathname === '/my-profile' ? 'var(--sidebar-active-text)' : 'var(--sidebar-text-muted)',
            }}
            aria-hidden="true"
          >
            <UserCircle size={15} />
          </span>
          My Profile
        </Link>

        {/* User card */}
        <div
          style={{
            display:         'flex',
            alignItems:      'center',
            gap:             '9px',
            padding:         '8px 10px',
            borderRadius:    '7px',
            backgroundColor: 'rgba(255,253,247,0.06)',
            border:          '1px solid var(--sidebar-border)',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width:           '28px',
              height:          '28px',
              borderRadius:    '50%',
              backgroundColor: 'var(--color-primary)',
              color:           '#fff',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              fontSize:        '10px',
              fontWeight:      700,
              flexShrink:      0,
              letterSpacing:   '0.02em',
            }}
            aria-hidden="true"
          >
            {getInitials(userFullName)}
          </div>

          {/* Name + role */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontSize:     '0.75rem',
                fontWeight:   600,
                color:        'var(--sidebar-text)',
                overflow:     'hidden',
                textOverflow: 'ellipsis',
                whiteSpace:   'nowrap',
              }}
            >
              {userFullName}
            </p>
            {systemRole && (
              <span
                style={{
                  display:         'inline-flex',
                  alignItems:      'center',
                  marginTop:       '3px',
                  padding:         '1px 7px',
                  borderRadius:    'var(--radius-pill)',
                  fontSize:        '0.5625rem',
                  fontWeight:      700,
                  letterSpacing:   '0.05em',
                  textTransform:   'uppercase',
                  backgroundColor: 'rgba(255,253,247,0.10)',
                  border:          '1px solid rgba(255,253,247,0.16)',
                  color:           'var(--sidebar-text-muted)',
                  whiteSpace:      'nowrap',
                }}
              >
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
              style={{
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                width:           '26px',
                height:          '26px',
                borderRadius:    '6px',
                border:          '1px solid rgba(255,253,247,0.14)',
                backgroundColor: 'rgba(255,253,247,0.06)',
                color:           'var(--sidebar-text-muted)',
                cursor:          'pointer',
                flexShrink:      0,
                transition:      'background-color 0.12s, color 0.12s, border-color 0.12s',
              }}
              className="signout-btn"
            >
              <LogOut size={12} aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
