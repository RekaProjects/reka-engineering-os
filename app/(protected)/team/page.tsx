import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import { UserSquare2 } from 'lucide-react'

export const metadata = {
  title: 'Team — Engineering Agency OS',
}

export default function TeamPage() {
  return (
    <div>
      <PageHeader
        title="Team"
        subtitle="Internal team members and subcontractors."
      />
      <SectionCard noPadding>
        <EmptyState
          icon={<UserSquare2 size={22} />}
          title="Team directory not yet implemented"
          description="Team members are managed through project assignments. Open any project and use the Team tab to add or remove members. A summary of who is working on what is visible on the Dashboard under Team Workload."
        />
      </SectionCard>
    </div>
  )
}
