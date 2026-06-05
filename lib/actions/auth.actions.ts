'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function signIn(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = signInSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  // Get user role for redirect
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication failed' }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()

  const role = userData?.role
  if (role === 'admin') redirect('/admin')
  else if (role === 'collector') redirect('/collector')
  else redirect('/contributor')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  return data
}

// Create a new auth user + users row (admin use)
export async function createAuthUser(data: {
  email: string
  password: string
  full_name: string
  phone: string
  role: 'admin' | 'collector' | 'contributor'
}) {
  const adminClient = createAdminClient()

  // Create auth user
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name,
      phone: data.phone,
      role: data.role,
    }
  })

  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Failed to create auth user' }
  }

  // Create or update users row (using upsert to avoid conflict with auth trigger)
  const { error: userError } = await adminClient.from('users').upsert({
    auth_user_id: authData.user.id,
    full_name: data.full_name,
    phone: data.phone,
    email: data.email,
    role: data.role,
    is_active: true,
  }, { onConflict: 'auth_user_id' })

  if (userError) {
    // Rollback: delete auth user
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return { error: userError.message }
  }

  return { success: true, userId: authData.user.id }
}
