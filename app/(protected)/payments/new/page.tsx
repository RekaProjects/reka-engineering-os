import { PageHeader }  from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { PaymentForm } from '@/components/modules/payments/PaymentForm'
import { getMemberOptions } from '@/lib/compensation/helpers'
import { createPayment } from '@/lib/payments/actions'

export const metadata = { title: 'New Payment — Engineering Agency OS' }

export default async function NewPaymentPage() {
  const members = await getMemberOptions()

  return (
    <div>
      <PageHeader
        title="New Payment Record"
        subtitle="Track a payment to a team member or freelancer."
      />
      <SectionCard>
        <PaymentForm
          members={members}
          action={createPayment}
          submitLabel="Create Payment"
        />
      </SectionCard>
    </div>
  )
}
