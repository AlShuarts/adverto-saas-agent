-- Fix search_path for all SECURITY DEFINER functions to prevent schema poisoning
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_facebook_credentials(_user_id uuid)
RETURNS TABLE(page_id text, access_token text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT facebook_page_id, facebook_access_token
  FROM public.social_tokens
  WHERE user_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_instagram_credentials(_user_id uuid)
RETURNS TABLE(instagram_user_id text, access_token text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT instagram_user_id, instagram_access_token
  FROM public.social_tokens
  WHERE user_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.increment_usage_statistic(user_id_param uuid, statistic_type text)
RETURNS void
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.usage_statistics (user_id)
  VALUES (user_id_param)
  ON CONFLICT (user_id) DO NOTHING;
  
  IF statistic_type = 'description' THEN
    UPDATE public.usage_statistics
    SET description_generations = description_generations + 1
    WHERE user_id = user_id_param;
  ELSIF statistic_type = 'slideshow' THEN
    UPDATE public.usage_statistics
    SET slideshow_generations = slideshow_generations + 1
    WHERE user_id = user_id_param;
  ELSIF statistic_type = 'facebook' THEN
    UPDATE public.usage_statistics
    SET facebook_generations = facebook_generations + 1
    WHERE user_id = user_id_param;
  ELSIF statistic_type = 'instagram' THEN
    UPDATE public.usage_statistics
    SET instagram_generations = instagram_generations + 1
    WHERE user_id = user_id_param;
  ELSIF statistic_type = 'banner' THEN
    UPDATE public.usage_statistics
    SET banner_generations = banner_generations + 1
    WHERE user_id = user_id_param;
  END IF;
END;
$$;

-- Clean up conflicting RLS policies on usage_statistics
DROP POLICY IF EXISTS "Users can update their own usage statistics" ON public.usage_statistics;
DROP POLICY IF EXISTS "Users can delete their own usage statistics" ON public.usage_statistics;