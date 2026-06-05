-- =============================================
-- Migration 003: Row Level Security Policies
-- =============================================

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM users WHERE auth_user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get current user's users.id
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get current collector's collectors.id
CREATE OR REPLACE FUNCTION get_collector_id()
RETURNS UUID AS $$
  SELECT c.id FROM collectors c
  JOIN users u ON u.id = c.user_id
  WHERE u.auth_user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get current contributor's contributors.id
CREATE OR REPLACE FUNCTION get_contributor_id()
RETURNS UUID AS $$
  SELECT c.id FROM contributors c
  JOIN users u ON u.id = c.user_id
  WHERE u.auth_user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============ Enable RLS on all tables ============
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE collectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE equb_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- ============ USERS ============
-- Admin: full access
CREATE POLICY "admin_users_all" ON users
  FOR ALL USING (get_user_role() = 'admin');

-- Users: read own row
CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (auth_user_id = auth.uid());

-- Users: update own row (name, phone)
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth_user_id = auth.uid());

-- ============ COLLECTORS ============
CREATE POLICY "admin_collectors_all" ON collectors
  FOR ALL USING (get_user_role() = 'admin');

-- Collector: read own row
CREATE POLICY "collector_read_own" ON collectors
  FOR SELECT USING (user_id = get_user_id());

-- ============ EQUB GROUPS ============
CREATE POLICY "admin_groups_all" ON equb_groups
  FOR ALL USING (get_user_role() = 'admin');

-- Collectors: read active groups
CREATE POLICY "collector_read_groups" ON equb_groups
  FOR SELECT USING (get_user_role() = 'collector' AND is_active = TRUE);

-- Contributors: read active groups
CREATE POLICY "contributor_read_groups" ON equb_groups
  FOR SELECT USING (get_user_role() = 'contributor' AND is_active = TRUE);

-- ============ CONTRIBUTORS ============
CREATE POLICY "admin_contributors_all" ON contributors
  FOR ALL USING (get_user_role() = 'admin');

-- Collector: read & write their assigned contributors
CREATE POLICY "collector_read_contributors" ON contributors
  FOR SELECT USING (collector_id = get_collector_id());

CREATE POLICY "collector_insert_contributors" ON contributors
  FOR INSERT WITH CHECK (collector_id = get_collector_id());

CREATE POLICY "collector_update_contributors" ON contributors
  FOR UPDATE USING (collector_id = get_collector_id());

-- Contributor: read own row
CREATE POLICY "contributor_read_own" ON contributors
  FOR SELECT USING (user_id = get_user_id());

-- ============ CONTRIBUTION RECORDS ============
CREATE POLICY "admin_contributions_all" ON contribution_records
  FOR ALL USING (get_user_role() = 'admin');

-- Collector: read & insert own records
CREATE POLICY "collector_read_contributions" ON contribution_records
  FOR SELECT USING (collector_id = get_collector_id());

CREATE POLICY "collector_insert_contributions" ON contribution_records
  FOR INSERT WITH CHECK (collector_id = get_collector_id());

-- Contributor: read own contributions
CREATE POLICY "contributor_read_contributions" ON contribution_records
  FOR SELECT USING (contributor_id = get_contributor_id());

-- ============ PAYOUT SCHEDULE ============
CREATE POLICY "admin_payout_all" ON payout_schedule
  FOR ALL USING (get_user_role() = 'admin');

-- Contributor: read own payout schedule
CREATE POLICY "contributor_read_payout" ON payout_schedule
  FOR SELECT USING (contributor_id = get_contributor_id());

-- Collector: read payout schedule for their contributors
CREATE POLICY "collector_read_payout" ON payout_schedule
  FOR SELECT USING (
    contributor_id IN (
      SELECT id FROM contributors WHERE collector_id = get_collector_id()
    )
  );

-- ============ SMS LOGS ============
-- Admin: read all (no client writes — server-only via service role)
CREATE POLICY "admin_sms_read" ON sms_logs
  FOR SELECT USING (get_user_role() = 'admin');

-- Collector: read SMS for their contributors
CREATE POLICY "collector_sms_read" ON sms_logs
  FOR SELECT USING (
    contributor_id IN (
      SELECT id FROM contributors WHERE collector_id = get_collector_id()
    )
  );
