-- Fix: Add RLS policies to social_tokens table to protect sensitive credentials
-- The existing SECURITY DEFINER functions (get_facebook_credentials, get_instagram_credentials) 
-- will continue to work for authorized access

-- Enable RLS on social_tokens (may already be enabled but ensuring)
ALTER TABLE public.social_tokens ENABLE ROW LEVEL SECURITY;

-- Deny all direct SELECT access - tokens must be accessed via secure functions
CREATE POLICY "No direct access to social tokens - use secure functions"
  ON public.social_tokens FOR SELECT
  USING (false);

-- Users can only insert/update their own tokens (via profile save operations)
CREATE POLICY "Users can insert their own social tokens"
  ON public.social_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social tokens"
  ON public.social_tokens FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own tokens (for disconnecting accounts)
CREATE POLICY "Users can delete their own social tokens"
  ON public.social_tokens FOR DELETE
  USING (auth.uid() = user_id);