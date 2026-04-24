import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getSessionProfile } from '@/lib/auth/session'
import { isManagement } from '@/lib/auth/permissions'

export default async function FinanceToolsLayout({ children }: { children: ReactNode }) {
  const profile = await getSessionProfile()
  if (!isManagement(profile.system_role)) {
    redirect('/dashboard')
  }
  return <>{children}</>
}
