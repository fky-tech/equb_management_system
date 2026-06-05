import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get user profile and redirect based on role
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('auth_user_id', user.id)
          .single()

        if (userData?.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin`)
        } else if (userData?.role === 'collector') {
          return NextResponse.redirect(`${origin}/collector`)
        } else {
          return NextResponse.redirect(`${origin}/contributor`)
        }
      }
    }
  }

  // Redirect to login on error or failure
  return NextResponse.redirect(`${origin}/login`)
}
