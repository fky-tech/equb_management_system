-- =============================================
-- Migration 006: Add payment_day to equb_groups
-- =============================================

ALTER TABLE equb_groups 
ADD COLUMN payment_day INTEGER CHECK (payment_day >= 1 AND payment_day <= 30);

COMMENT ON COLUMN equb_groups.payment_day IS 'The day of the Ethiopian month (1-30) when payment is due for monthly/weekly groups.';
