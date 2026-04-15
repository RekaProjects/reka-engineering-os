import { getSessionProfile, requireRole } from '@/lib/auth/session'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import { Settings } from 'lucide-react'

export const metadata = {
  title: 'Settings — Engineering Agency OS',
}

export default async function SettingsPage() {
  const _sp = await getSessionProfile()
  requireRole(_sp.system_role, ['admin'])
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Application configuration, templates, and preferences."
      />
      <SectionCard noPadding>
        <EmptyState
          icon={<Settings size={22} />}
          title="Settings not implemented in this MVP"
          description="This area is reserved for future configuration such as project templates, status labels, and user preferences. For now, all configuration is done directly in the database."
        />
      </SectionCard>
    </div>
  )
}
