-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS public.increment_usage_statistic(uuid, text);

-- Recréer avec SECURITY DEFINER explicite pour bypasser les RLS
CREATE OR REPLACE FUNCTION public.increment_usage_statistic(
  user_id_param uuid, 
  statistic_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
BEGIN
  -- S'assurer qu'une ligne existe pour cet utilisateur
  INSERT INTO public.usage_statistics (user_id)
  VALUES (user_id_param)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Incrémenter le bon compteur selon le type
  IF statistic_type = 'description' THEN
    UPDATE public.usage_statistics
    SET description_generations = description_generations + 1,
        updated_at = now()
    WHERE user_id = user_id_param;
    
  ELSIF statistic_type = 'slideshow' THEN
    UPDATE public.usage_statistics
    SET slideshow_generations = slideshow_generations + 1,
        updated_at = now()
    WHERE user_id = user_id_param;
    
  ELSIF statistic_type = 'facebook' THEN
    UPDATE public.usage_statistics
    SET facebook_generations = facebook_generations + 1,
        updated_at = now()
    WHERE user_id = user_id_param;
    
  ELSIF statistic_type = 'instagram' THEN
    UPDATE public.usage_statistics
    SET instagram_generations = instagram_generations + 1,
        updated_at = now()
    WHERE user_id = user_id_param;
    
  ELSIF statistic_type = 'banner' THEN
    UPDATE public.usage_statistics
    SET banner_generations = banner_generations + 1,
        updated_at = now()
    WHERE user_id = user_id_param;
    
  END IF;
  
  -- Log pour debug
  RAISE NOTICE 'Statistique % incrémentée pour user %', statistic_type, user_id_param;
END;
$$;

-- S'assurer que la fonction est accessible
GRANT EXECUTE ON FUNCTION public.increment_usage_statistic(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage_statistic(uuid, text) TO anon;