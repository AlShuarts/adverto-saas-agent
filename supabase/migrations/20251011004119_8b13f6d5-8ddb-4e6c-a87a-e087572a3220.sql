-- Clean up any existing duplicates (keep the most recent entry per user)
DELETE FROM usage_statistics a 
USING usage_statistics b
WHERE a.user_id = b.user_id 
  AND a.created_at < b.created_at;

-- Add unique constraint on user_id
ALTER TABLE usage_statistics 
ADD CONSTRAINT usage_statistics_user_id_key UNIQUE (user_id);