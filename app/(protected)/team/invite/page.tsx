import { getSessionProfile, requireRole } from '@/lib/auth/session'
import { PageHeader }  from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { InviteForm }  from '@/components/modules/team/InviteForm'

export const metadata = { title: 'Invite Member — Engineering Agency OS' }

export default async function InviteMemberPage() {
  const profile = await getSessionProfile()
  requireRole(profile.system_role, ['admin'])

  return (
    <div>
      <PageHeader
        title="Invite Member"
        subtitle="Create an invite link to send to a new team member or freelancer."
      />
      <SectionCard>
        <InviteForm />
      </SectionCard>
    </div>
  )
}
