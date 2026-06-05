import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth.actions'

export default async function IndexPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'admin') {
    redirect('/admin')
  } else if (user.role === 'collector') {
    redirect('/collector')
  } else {
    redirect('/contributor')
  }
}
