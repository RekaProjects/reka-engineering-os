import { PageHeader }  from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { CompensationForm } from '@/components/modules/compensation/CompensationForm'
import { getMemberOptions, getProjectOptions } from '@/lib/compensation/helpers'
import { createCompensation } from '@/lib/compensation/actions'

export const metadata = { title: 'New Compensation Record — Engineering Agency OS' }

export default async function NewCompensationPage() {
  const [members, projects] = await Promise.all([
    getMemberOptions(),
    getProjectOptions(),
  ])

  return (
    <div>
      <PageHeader
        title="New Compensation Record"
        subtitle="Track work-based compensation for a team member."
      />
      <SectionCard>
        <CompensationForm
          members={members}
          projects={projects}
          action={createCompensation}
          submitLabel="Create Record"
        />
      </SectionCard>
    </div>
  )
}
