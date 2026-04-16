import Link     from 'next/link'
import { AppSidebar }    from '@/components/layout/AppSidebar'
import { AppTopbar }     from '@/components/layout/AppTopbar'
import { TopbarSearch }  from '@/components/layout/TopbarSearch'
import { BreadcrumbNav } from '@/components/layout/BreadcrumbNav'
import { getSessionProfile } from '@/lib/auth/session'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getSessionProfile()

  const profileIncomplete = profile.profile_completed_at === null

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppSidebar
        userFullName={profile.full_name}
        userEmail={profile.email}
        systemRole={profile.system_role}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AppTopbar left={<BreadcrumbNav />} right={<TopbarSearch />} />

        {/* Profile completion banner */}
        {profileIncomplete && (
          <div
            style={{
              padding:         '10px 28px',
              backgroundColor: 'var(--color-warning-subtle)',
              borderBottom:    '1px solid var(--color-border)',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'space-between',
              gap:             '12px',
              flexShrink:      0,
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-warning)' }}>
              Your profile is incomplete. Complete it so the team knows how to reach you and what you work on.
            </span>
            <Link
              href="/onboarding/complete"
              style={{
                fontSize:        '0.8125rem',
                fontWeight:      600,
                color:           'var(--color-warning)',
                textDecoration:  'none',
                whiteSpace:      'nowrap',
                padding:         '4px 12px',
                border:          '1px solid var(--color-border-strong)',
                borderRadius:    'var(--radius-control)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              Complete profile →
            </Link>
          </div>
        )}

        <main
          style={{
            flex:            1,
            overflowY:       'auto',
            backgroundColor: 'var(--color-background)',
          }}
        >
          <div
            style={{
              maxWidth: 'var(--content-max-width)',
              margin:   '0 auto',
              padding:  '28px 32px',
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
