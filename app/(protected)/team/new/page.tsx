import { getSessionProfile, requireRole } from '@/lib/auth/session'
import { PageHeader }      from '@/components/layout/PageHeader'
import { SectionCard }     from '@/components/shared/SectionCard'
import { TeamMemberForm }  from '@/components/modules/team/TeamMemberForm'

export const metadata = { title: 'Add Member — Engineering Agency OS' }

export default async function NewTeamMemberPage() {
  const profile = await getSessionProfile()
  requireRole(profile.system_role, ['admin'])

  return (
    <div>
      <PageHeader
        title="Add Member"
        subtitle="Create a new team member or freelancer account."
      />
      <SectionCard>
        <TeamMemberForm mode="create" />
      </SectionCard>
    </div>
  )
}
