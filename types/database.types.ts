// =============================================
// Database Types — Equb Management System
// Auto-aligned with Supabase schema
// =============================================

export type UserRole = 'admin' | 'collector' | 'contributor'

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_user_id: string | null
          full_name: string
          phone: string
          email: string | null
          role: UserRole
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          full_name: string
          phone: string
          email?: string | null
          role?: UserRole
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          full_name?: string
          phone?: string
          email?: string | null
          role?: UserRole
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      collectors: {
        Row: {
          id: string
          user_id: string
          employee_code: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          employee_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          employee_code?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collectors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      equb_groups: {
        Row: {
          id: string
          name: string
          contribution_amount: number
          total_days: number
          frequency: 'daily' | 'weekly' | 'monthly'
          start_date: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          contribution_amount: number
          total_days: number
          frequency?: 'daily' | 'weekly' | 'monthly'
          start_date?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          contribution_amount?: number
          total_days?: number
          frequency?: 'daily' | 'weekly' | 'monthly'
          start_date?: string
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      contributors: {
        Row: {
          id: string
          user_id: string | null
          collector_id: string
          group_id: string
          payout_position: number | null
          joined_at: string
          status: 'active' | 'inactive' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          collector_id: string
          group_id: string
          payout_position?: number | null
          joined_at?: string
          status?: 'active' | 'inactive' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          collector_id?: string
          group_id?: string
          payout_position?: number | null
          joined_at?: string
          status?: 'active' | 'inactive' | 'completed'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributors_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "collectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributors_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "equb_groups"
            referencedColumns: ["id"]
          }
        ]
      }
      contribution_records: {
        Row: {
          id: string
          contributor_id: string
          collector_id: string
          contribution_date: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          contributor_id: string
          collector_id: string
          contribution_date: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          contributor_id?: string
          collector_id?: string
          contribution_date?: string
          amount?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contribution_records_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contribution_records_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "collectors"
            referencedColumns: ["id"]
          }
        ]
      }
      payout_schedule: {
        Row: {
          id: string
          contributor_id: string
          payout_order: number
          payout_date: string | null
          is_paid: boolean
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contributor_id: string
          payout_order: number
          payout_date?: string | null
          is_paid?: boolean
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          contributor_id?: string
          payout_order?: number
          payout_date?: string | null
          is_paid?: boolean
          paid_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_schedule_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          }
        ]
      }
      sms_logs: {
        Row: {
          id: string
          contributor_id: string | null
          phone: string | null
          sms_type: 'reminder' | 'confirmation' | 'custom' | null
          message: string | null
          status: 'sent' | 'failed' | 'pending' | null
          sent_at: string
        }
        Insert: {
          id?: string
          contributor_id?: string | null
          phone?: string | null
          sms_type?: 'reminder' | 'confirmation' | 'custom' | null
          message?: string | null
          status?: 'sent' | 'failed' | 'pending' | null
          sent_at?: string
        }
        Update: {
          id?: string
          contributor_id?: string | null
          phone?: string | null
          sms_type?: 'reminder' | 'confirmation' | 'custom' | null
          message?: string | null
          status?: 'sent' | 'failed' | 'pending' | null
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "contributors"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      get_user_role: {
        Args: Record<string, never>
        Returns: UserRole
      }
      get_user_id: {
        Args: Record<string, never>
        Returns: string
      }
      get_collector_id: {
        Args: Record<string, never>
        Returns: string
      }
      get_contributor_id: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: {
      user_role: UserRole
    }
    CompositeTypes: Record<string, never>
  }
}

// =============================================
// Utility types mapped from Database shape
// =============================================
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type User = Tables<'users'>
export type Collector = Tables<'collectors'>
export type EqubGroup = Tables<'equb_groups'>
export type Contributor = Tables<'contributors'>
export type ContributionRecord = Tables<'contribution_records'>
export type PayoutSchedule = Tables<'payout_schedule'>
export type SmsLog = Tables<'sms_logs'>

// Extended types with joins
export type ContributorWithDetails = Contributor & {
  users: User | null
  collectors: (Collector & { users: User | null }) | null
  equb_groups: EqubGroup | null
  paid_days?: number
  remaining_days?: number
}

export type CollectorWithUser = Collector & {
  users: User | null
}

export type ContributionWithContributor = ContributionRecord & {
  contributors: ContributorWithDetails | null
}

export type PayoutWithContributor = PayoutSchedule & {
  contributors: ContributorWithDetails | null
}

// Dashboard stat types
export type AdminStats = {
  totalContributors: number
  totalCollectors: number
  activeGroups: number
  contributionsToday: number
  pendingToday: number
}

export type CollectorStats = {
  totalAssigned: number
  paidToday: number
  notPaidToday: number
}

export type ContributorStats = {
  paidDays: number
  totalDays: number
  remainingDays: number
  progressPercent: number
  payoutPosition: number | null
  nextPayoutDate: string | null
}
