import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { ProjectForm } from '@/components/modules/projects/ProjectForm'
import { getProjectById } from '@/lib/projects/queries'
import { getClientsForSelect } from '@/lib/clients/queries'
import { getUsersForSelect } from '@/lib/users/queries'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const project = await getProjectById(id)
  return { title: project ? `Edit ${project.name} — Engineering Agency OS` : 'Project Not Found' }
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params
  const [project, clients, users] = await Promise.all([
    getProjectById(id),
    getClientsForSelect(),
    getUsersForSelect(),
  ])

  if (!project) notFound()

  return (
    <div>
      <PageHeader
        title={`Edit: ${project.name}`}
        subtitle={`${project.project_code}`}
      />
      <SectionCard>
        <ProjectForm mode="edit" project={project} clients={clients} users={users} />
      </SectionCard>
    </div>
  )
}
