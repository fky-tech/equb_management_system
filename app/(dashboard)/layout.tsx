import { getCurrentUser } from '@/lib/actions/auth.actions'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardShell user={{ full_name: user.full_name, role: user.role }}>
      {children}
    </DashboardShell>
  )
}
