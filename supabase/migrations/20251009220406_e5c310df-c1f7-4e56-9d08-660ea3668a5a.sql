-- Secure storage for social tokens and remove plaintext tokens from profiles

-- 1) Create table for social tokens
CREATE TABLE IF NOT EXISTS public.social_tokens (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  facebook_page_id text,
  facebook_access_token text,
  instagram_user_id text,
  instagram_access_token text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2) Enable RLS and deny direct access by default (no policies created)
ALTER TABLE public.social_tokens ENABLE ROW LEVEL SECURITY;

-- 3) Security definer functions to access credentials
CREATE OR REPLACE FUNCTION public.get_facebook_credentials(_user_id uuid)
RETURNS TABLE(page_id text, access_token text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT facebook_page_id, facebook_access_token
  FROM public.social_tokens
  WHERE user_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_instagram_credentials(_user_id uuid)
RETURNS TABLE(instagram_user_id text, access_token text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT instagram_user_id, instagram_access_token
  FROM public.social_tokens
  WHERE user_id = _user_id;
$$;

-- 4) Trigger to migrate tokens written to profiles into social_tokens and nullify columns
CREATE OR REPLACE FUNCTION public.migrate_profile_tokens()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Upsert Facebook credentials if provided
  IF NEW.facebook_page_id IS NOT NULL OR NEW.facebook_access_token IS NOT NULL THEN
    INSERT INTO public.social_tokens (user_id, facebook_page_id, facebook_access_token, updated_at)
    VALUES (NEW.id, NEW.facebook_page_id, NEW.facebook_access_token, now())
    ON CONFLICT (user_id) DO UPDATE SET
      facebook_page_id = COALESCE(EXCLUDED.facebook_page_id, public.social_tokens.facebook_page_id),
      facebook_access_token = COALESCE(EXCLUDED.facebook_access_token, public.social_tokens.facebook_access_token),
      updated_at = now();
  END IF;

  -- Upsert Instagram credentials if provided
  IF NEW.instagram_user_id IS NOT NULL OR NEW.instagram_access_token IS NOT NULL THEN
    INSERT INTO public.social_tokens (user_id, instagram_user_id, instagram_access_token, updated_at)
    VALUES (NEW.id, NEW.instagram_user_id, NEW.instagram_access_token, now())
    ON CONFLICT (user_id) DO UPDATE SET
      instagram_user_id = COALESCE(EXCLUDED.instagram_user_id, public.social_tokens.instagram_user_id),
      instagram_access_token = COALESCE(EXCLUDED.instagram_access_token, public.social_tokens.instagram_access_token),
      updated_at = now();
  END IF;

  -- Nullify sensitive columns on profiles to avoid plaintext storage
  NEW.facebook_access_token := NULL;
  NEW.instagram_access_token := NULL;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_migrate_profile_tokens ON public.profiles;
CREATE TRIGGER trg_migrate_profile_tokens
BEFORE INSERT OR UPDATE OF facebook_access_token, instagram_access_token, facebook_page_id, instagram_user_id ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.migrate_profile_tokens();

-- 5) Backfill: move existing tokens from profiles
INSERT INTO public.social_tokens (user_id, facebook_page_id, facebook_access_token, instagram_user_id, instagram_access_token)
SELECT id, facebook_page_id, facebook_access_token, instagram_user_id, instagram_access_token
FROM public.profiles
WHERE facebook_access_token IS NOT NULL OR instagram_access_token IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  facebook_page_id = COALESCE(EXCLUDED.facebook_page_id, public.social_tokens.facebook_page_id),
  facebook_access_token = COALESCE(EXCLUDED.facebook_access_token, public.social_tokens.facebook_access_token),
  instagram_user_id = COALESCE(EXCLUDED.instagram_user_id, public.social_tokens.instagram_user_id),
  instagram_access_token = COALESCE(EXCLUDED.instagram_access_token, public.social_tokens.instagram_access_token),
  updated_at = now();

-- 6) Nullify tokens in profiles after backfill
UPDATE public.profiles
SET facebook_access_token = NULL,
    instagram_access_token = NULL
WHERE facebook_access_token IS NOT NULL OR instagram_access_token IS NOT NULL;