'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createAuthUser } from './auth.actions'
import { z } from 'zod'

const collectorSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(9),
  employee_code: z.string().optional(),
  password: z.string().min(8).optional(),
})

export async function getCollectors() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('collectors')
    .select(`
      *,
      users (*)
    `)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message, data: [] }
  return { data: data ?? [], error: null }
}

export async function getCollectorById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('collectors')
    .select(`*, users (*)`)
    .eq('id', id)
    .single()

  if (error) return { error: error.message, data: null }
  return { data, error: null }
}

export async function createCollector(formData: FormData) {
  const raw = {
    full_name: formData.get('full_name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    employee_code: formData.get('employee_code') as string | undefined,
    password: formData.get('password') as string,
  }

  const parsed = collectorSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  // Create auth user + users row
  const authResult = await createAuthUser({
    email: parsed.data.email,
    password: parsed.data.password ?? 'Equb@2024!',
    full_name: parsed.data.full_name,
    phone: parsed.data.phone,
    role: 'collector',
  })

  if (authResult.error) return { error: authResult.error }

  // Get the newly created user
  const adminClient = createAdminClient()
  const { data: userData } = await adminClient
    .from('users')
    .select('id')
    .eq('phone', parsed.data.phone)
    .single()

  if (!userData) return { error: 'Failed to find created user' }

  // Create collector row
  const { error } = await adminClient.from('collectors').insert({
    user_id: userData.id,
    employee_code: parsed.data.employee_code ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/collectors')
  return { success: true }
}

export async function updateCollector(id: string, formData: FormData) {
  const adminClient = createAdminClient()

  const full_name = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const employee_code = formData.get('employee_code') as string

  // Get user_id from collector
  const { data: collector } = await adminClient
    .from('collectors')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!collector) return { error: 'Collector not found' }

  // Update users table
  const { error: userError } = await adminClient
    .from('users')
    .update({ full_name, phone })
    .eq('id', collector.user_id)

  if (userError) return { error: userError.message }

  // Update collector row
  const { error } = await adminClient
    .from('collectors')
    .update({ employee_code: employee_code || null })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/collectors')
  return { success: true }
}

export async function toggleCollectorStatus(collectorId: string, currentStatus: boolean) {
  const adminClient = createAdminClient()

  // Get user_id
  const { data: collector } = await adminClient
    .from('collectors')
    .select('user_id')
    .eq('id', collectorId)
    .single()

  if (!collector) return { error: 'Collector not found' }

  const { error } = await adminClient
    .from('users')
    .update({ is_active: !currentStatus })
    .eq('id', collector.user_id)

  if (error) return { error: error.message }

  revalidatePath('/admin/collectors')
  return { success: true }
}
