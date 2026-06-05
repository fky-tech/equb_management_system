import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Public paths that don't need auth
  const publicPaths = ['/login', '/auth/callback']
  const isPublicPath = publicPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname === '/login') {
    // Get user role to redirect correctly
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('auth_user_id', user.id)
      .single()

    const role = userData?.role
    const url = request.nextUrl.clone()
    if (role === 'admin') url.pathname = '/admin'
    else if (role === 'collector') url.pathname = '/collector'
    else url.pathname = '/contributor'
    return NextResponse.redirect(url)
  }

  // Role-based route protection
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('auth_user_id', user.id)
      .single()

    const role = userData?.role
    const path = request.nextUrl.pathname

    if (path.startsWith('/admin') && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'collector' ? '/collector' : '/contributor'
      return NextResponse.redirect(url)
    }

    if (path.startsWith('/collector') && role !== 'collector') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'admin' ? '/admin' : '/contributor'
      return NextResponse.redirect(url)
    }

    if (path.startsWith('/contributor') && role !== 'contributor') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'admin' ? '/admin' : '/collector'
      return NextResponse.redirect(url)
    }

    // Root redirect
    if (path === '/') {
      const url = request.nextUrl.clone()
      if (role === 'admin') url.pathname = '/admin'
      else if (role === 'collector') url.pathname = '/collector'
      else url.pathname = '/contributor'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
