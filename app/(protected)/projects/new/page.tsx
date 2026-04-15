import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { ProjectForm } from '@/components/modules/projects/ProjectForm'
import { getClientsForSelect } from '@/lib/clients/queries'
import { getUsersForSelect } from '@/lib/users/queries'

export const metadata = { title: 'New Project — Engineering Agency OS' }

export default async function NewProjectPage() {
  const [clients, users] = await Promise.all([
    getClientsForSelect(),
    getUsersForSelect(),
  ])

  return (
    <div>
      <PageHeader
        title="New Project"
        subtitle="Create a new engineering project."
      />
      <SectionCard>
        <ProjectForm mode="create" clients={clients} users={users} />
      </SectionCard>
    </div>
  )
}
