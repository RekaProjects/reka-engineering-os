import { notFound, redirect } from 'next/navigation'
import { getSessionProfile, requireRole } from '@/lib/auth/session'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { ConvertIntakeForm } from '@/components/modules/intakes/ConvertIntakeForm'
import { getIntakeById } from '@/lib/intakes/queries'
import { getClientsForSelect } from '@/lib/clients/queries'
import { getUsersForSelect } from '@/lib/users/queries'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const intake = await getIntakeById(id)
  return {
    title: intake
      ? `Convert: ${intake.title} — Engineering Agency OS`
      : 'Intake Not Found',
  }
}

export default async function ConvertIntakePage({ params }: PageProps) {
  const _sp = await getSessionProfile()
  requireRole(_sp.system_role, ['admin', 'coordinator'])

  const { id } = await params
  const intake = await getIntakeById(id)
  if (!intake) notFound()

  // Prevent re-conversion
  if (intake.status === 'converted') {
    redirect(`/intakes/${id}`)
  }

  const [clients, users] = await Promise.all([
    getClientsForSelect(),
    getUsersForSelect(),
  ])

  return (
    <div>
      <PageHeader
        title="Convert Intake to Project"
        subtitle={`${intake.intake_code} · ${intake.title}`}
      />
      <SectionCard>
        <ConvertIntakeForm intake={intake} clients={clients} users={users} />
      </SectionCard>
    </div>
  )
}
