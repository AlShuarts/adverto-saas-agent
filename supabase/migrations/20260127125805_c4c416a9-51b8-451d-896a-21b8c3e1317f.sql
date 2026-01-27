-- Table pour stocker les rapports d'erreurs
CREATE TABLE public.error_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informations utilisateur
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  
  -- Contexte de l'erreur
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  
  -- Détails techniques
  page_url TEXT,
  action_context TEXT,
  browser_info JSONB,
  
  -- Données spécifiques Facebook/Instagram
  facebook_response JSONB,
  permissions_granted TEXT[],
  permissions_denied TEXT[],
  
  -- Console logs (derniers 20 logs)
  console_logs JSONB,
  
  -- Données additionnelles
  additional_data JSONB,
  
  -- Statut de résolution
  status TEXT DEFAULT 'new',
  admin_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour performance
CREATE INDEX idx_error_reports_user_id ON error_reports(user_id);
CREATE INDEX idx_error_reports_status ON error_reports(status);
CREATE INDEX idx_error_reports_error_type ON error_reports(error_type);
CREATE INDEX idx_error_reports_created_at ON error_reports(created_at DESC);

-- RLS
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- Admins peuvent tout lire
CREATE POLICY "Admins can read all error reports"
ON error_reports FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Les utilisateurs peuvent insérer leurs propres rapports
CREATE POLICY "Anyone can insert error reports"
ON error_reports FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admins peuvent mettre à jour
CREATE POLICY "Admins can update error reports"
ON error_reports FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_error_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_error_reports_updated_at
BEFORE UPDATE ON error_reports
FOR EACH ROW
EXECUTE FUNCTION update_error_reports_updated_at();