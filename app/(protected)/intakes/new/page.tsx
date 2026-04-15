import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { IntakeForm } from '@/components/modules/intakes/IntakeForm'
import { getClientsForSelect } from '@/lib/clients/queries'

export const metadata = { title: 'New Intake — Engineering Agency OS' }

export default async function NewIntakePage() {
  const clients = await getClientsForSelect()

  return (
    <div style={{ maxWidth: '720px' }}>
      <PageHeader
        title="New Intake"
        subtitle="Log an incoming lead or project opportunity."
      />
      <SectionCard>
        <IntakeForm mode="create" clients={clients} />
      </SectionCard>
    </div>
  )
}
