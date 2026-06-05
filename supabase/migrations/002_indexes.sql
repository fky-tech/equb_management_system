-- =============================================
-- Migration 002: Indexes
-- =============================================

-- Users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_phone ON users(phone);

-- Equb groups
CREATE INDEX idx_equb_groups_active ON equb_groups(is_active);

-- Contributors
CREATE INDEX idx_contributors_group ON contributors(group_id);
CREATE INDEX idx_contributors_collector ON contributors(collector_id);
CREATE INDEX idx_contributors_status ON contributors(status);
CREATE INDEX idx_contributors_payout_position ON contributors(payout_position);

-- Contribution records
CREATE INDEX idx_contributions_collector ON contribution_records(collector_id);
CREATE INDEX idx_contributions_contributor_date
  ON contribution_records(contributor_id, contribution_date DESC);
CREATE INDEX idx_contributions_date_desc
  ON contribution_records(contribution_date DESC);
CREATE INDEX idx_contributions_amount ON contribution_records(amount);

-- Payout schedule
CREATE INDEX idx_payout_schedule_payout_date ON payout_schedule(payout_date);
CREATE INDEX idx_payout_schedule_is_paid ON payout_schedule(is_paid);
CREATE INDEX idx_payout_schedule_contributor_order
  ON payout_schedule(contributor_id, payout_order);
-- Partial index: upcoming unpaid payouts
CREATE INDEX idx_payout_schedule_unpaid
  ON payout_schedule(payout_date)
  WHERE is_paid = FALSE;

-- SMS logs
CREATE INDEX idx_sms_logs_phone ON sms_logs(phone);
CREATE INDEX idx_sms_logs_sent_at_desc ON sms_logs(sent_at DESC);
CREATE INDEX idx_sms_logs_type ON sms_logs(sms_type);
CREATE INDEX idx_sms_logs_contributor ON sms_logs(contributor_id);
