

# Plan: Système de Rapports d'Erreurs pour Administrateurs

## Objectif
Créer un système complet qui capture automatiquement les erreurs des utilisateurs et les rend accessibles aux administrateurs, avec tous les détails techniques nécessaires pour le diagnostic.

## Architecture du système

```text
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │  useErrorReport  │───>│  Capture automatique:            │   │
│  │      Hook        │    │  - Erreurs catch/toast           │   │
│  └──────────────────┘    │  - Contexte utilisateur          │   │
│           │              │  - Logs console récents           │   │
│           ▼              │  - Infos navigateur/appareil     │   │
│  ┌──────────────────┐    └──────────────────────────────────┘   │
│  │ Edge Function    │                                           │
│  │ report-error     │                                           │
└──┼──────────────────┼───────────────────────────────────────────┘
   │                  │
   ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                   │
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │  error_reports   │    │  Notification optionnelle:       │   │
│  │     Table        │───>│  - Webhook Slack/Discord         │   │
│  └──────────────────┘    │  - Email via Resend (si config)  │   │
│           │              └──────────────────────────────────┘   │
│           ▼                                                      │
│  ┌──────────────────┐                                           │
│  │  Dashboard Admin │                                           │
│  │  /admin/errors   │                                           │
│  └──────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Partie 1: Base de données

### Nouvelle table `error_reports`

```sql
CREATE TABLE public.error_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Informations utilisateur
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,
  
  -- Contexte de l'erreur
  error_type TEXT NOT NULL,           -- 'facebook_connection', 'instagram_connection', 'slideshow', 'import', etc.
  error_message TEXT NOT NULL,
  error_stack TEXT,
  
  -- Détails techniques
  page_url TEXT,
  action_context TEXT,                -- 'connecting_facebook', 'publishing_post', etc.
  browser_info JSONB,                 -- { userAgent, language, platform }
  
  -- Données spécifiques Facebook/Instagram
  facebook_response JSONB,            -- Réponse brute de l'API Facebook
  permissions_granted TEXT[],
  permissions_denied TEXT[],
  
  -- Console logs (derniers 20 logs)
  console_logs JSONB,
  
  -- Statut de résolution
  status TEXT DEFAULT 'new',          -- 'new', 'investigating', 'resolved', 'wont_fix'
  admin_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
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

-- RLS: Seuls les admins peuvent lire
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all error reports"
ON error_reports FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own error reports"
ON error_reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can update error reports"
ON error_reports FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

---

## Partie 2: Hook Frontend `useErrorReport`

### Nouveau fichier: `src/hooks/useErrorReport.ts`

Ce hook capture et envoie automatiquement les erreurs:

```typescript
import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";

type ErrorContext = {
  errorType: string;
  actionContext?: string;
  facebookResponse?: any;
  permissionsGranted?: string[];
  permissionsDenied?: string[];
  additionalData?: Record<string, any>;
};

export const useErrorReport = () => {
  const { profile } = useProfile();
  const consoleLogsRef = useRef<any[]>([]);
  
  // Intercepter les logs console (garder les 20 derniers)
  const captureConsoleLogs = useCallback(() => {
    // Retourner les derniers logs capturés
    return consoleLogsRef.current.slice(-20);
  }, []);
  
  const reportError = useCallback(async (
    error: Error | string,
    context: ErrorContext
  ) => {
    try {
      const errorMessage = error instanceof Error ? error.message : error;
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Collecter les informations du navigateur
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      
      // Obtenir l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      // Envoyer le rapport via Edge Function
      await supabase.functions.invoke('report-error', {
        body: {
          userId: user?.id,
          userEmail: user?.email,
          userName: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : null,
          
          errorType: context.errorType,
          errorMessage,
          errorStack,
          
          pageUrl: window.location.href,
          actionContext: context.actionContext,
          browserInfo,
          
          facebookResponse: context.facebookResponse,
          permissionsGranted: context.permissionsGranted,
          permissionsDenied: context.permissionsDenied,
          
          consoleLogs: captureConsoleLogs(),
          additionalData: context.additionalData,
        }
      });
      
      console.log("📧 Rapport d'erreur envoyé aux administrateurs");
    } catch (reportError) {
      // Ne pas bloquer l'utilisateur si le rapport échoue
      console.error("Échec de l'envoi du rapport d'erreur:", reportError);
    }
  }, [profile, captureConsoleLogs]);
  
  return { reportError };
};
```

---

## Partie 3: Edge Function `report-error`

### Nouveau fichier: `supabase/functions/report-error/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    
    // Insérer le rapport d'erreur
    const { data, error } = await supabase
      .from('error_reports')
      .insert({
        user_id: body.userId,
        user_email: body.userEmail,
        user_name: body.userName,
        error_type: body.errorType,
        error_message: body.errorMessage,
        error_stack: body.errorStack,
        page_url: body.pageUrl,
        action_context: body.actionContext,
        browser_info: body.browserInfo,
        facebook_response: body.facebookResponse,
        permissions_granted: body.permissionsGranted,
        permissions_denied: body.permissionsDenied,
        console_logs: body.consoleLogs,
      })
      .select()
      .single();

    if (error) throw error;

    // Optionnel: Envoyer une notification Slack/Discord
    const webhookUrl = Deno.env.get("ERROR_NOTIFICATION_WEBHOOK");
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Nouvelle erreur signalée`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Type:* ${body.errorType}\n*Utilisateur:* ${body.userName || 'Anonyme'} (${body.userEmail || 'N/A'})\n*Message:* ${body.errorMessage?.substring(0, 200)}`
              }
            }
          ]
        })
      });
    }

    return new Response(
      JSON.stringify({ success: true, reportId: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## Partie 4: Intégration dans le code existant

### Modifications dans `src/hooks/useProfile.tsx`

Ajouter le rapport d'erreur automatique lors des erreurs Facebook:

```typescript
// Importer le hook
import { useErrorReport } from "./useErrorReport";

// Dans le composant
const { reportError } = useErrorReport();

// Dans handleFacebookLoginResponse, après le catch (ligne 290)
} catch (error) {
  console.error("❌ Erreur complète:", error);
  
  // Envoyer le rapport d'erreur aux admins
  await reportError(error instanceof Error ? error : new Error(String(error)), {
    errorType: 'facebook_connection',
    actionContext: 'connecting_facebook_page',
    facebookResponse: (window as any).__lastFacebookResponse,
    permissionsGranted: (window as any).__fbPermissionsGranted,
    permissionsDenied: (window as any).__fbPermissionsDenied,
  });
  
  toast({
    title: "Erreur de connexion Facebook",
    description: (error instanceof Error ? error.message : "..."),
    variant: "destructive",
  });
}
```

### Modifications similaires dans:
- `connectInstagram()` - pour les erreurs Instagram
- `src/services/centrisImportService.ts` - pour les erreurs d'import
- `src/hooks/useFacebookPublish.tsx` - pour les erreurs de publication
- Edge functions - pour capturer les erreurs côté serveur

---

## Partie 5: Dashboard Admin des Erreurs

### Nouveau fichier: `src/pages/AdminErrors.tsx`

Page dédiée pour visualiser et gérer les rapports d'erreurs:

```typescript
// Fonctionnalités:
// - Liste des erreurs avec filtres (type, statut, date)
// - Détail d'une erreur avec toutes les infos
// - Marquage comme "en cours", "résolu", "ignoré"
// - Notes admin pour documenter la résolution
// - Recherche par utilisateur/email
// - Export CSV des erreurs
```

### Modifications dans `src/pages/Admin.tsx`

Ajouter un onglet/lien vers la page des erreurs:

```typescript
// Ajouter un nouveau Tab "Erreurs" dans la page admin
<Tabs>
  <TabsTrigger value="stats">Statistiques</TabsTrigger>
  <TabsTrigger value="errors">Erreurs ({unreadErrorsCount})</TabsTrigger>
</Tabs>
```

---

## Partie 6: Configuration optionnelle

### Notifications Slack (recommandé)
1. Créer un Webhook Slack: https://api.slack.com/messaging/webhooks
2. Ajouter le secret `ERROR_NOTIFICATION_WEBHOOK` dans Supabase

### Notifications Discord (alternative)
1. Créer un Webhook Discord dans les paramètres du canal
2. Utiliser le même format de webhook

---

## Fichiers à créer/modifier

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/hooks/useErrorReport.ts` | Créer | Hook pour capturer et envoyer les erreurs |
| `supabase/functions/report-error/index.ts` | Créer | Edge function pour stocker les rapports |
| `src/pages/AdminErrors.tsx` | Créer | Dashboard de visualisation des erreurs |
| `src/hooks/useProfile.tsx` | Modifier | Intégrer le rapport d'erreurs automatique |
| `src/pages/Admin.tsx` | Modifier | Ajouter navigation vers les erreurs |
| Migration SQL | Créer | Table `error_reports` avec RLS |

---

## Informations capturées pour chaque erreur

| Catégorie | Données |
|-----------|---------|
| **Utilisateur** | ID, email, nom complet |
| **Erreur** | Type, message, stack trace |
| **Contexte** | Page URL, action en cours |
| **Navigateur** | User agent, langue, taille d'écran |
| **Facebook** | Réponse API brute, permissions accordées/refusées |
| **Console** | 20 derniers logs console |
| **Timestamps** | Date de création, mise à jour |

---

## Exemple de rapport d'erreur capturé

```json
{
  "user_name": "Jean Dupont",
  "user_email": "jean@example.com",
  "error_type": "facebook_connection",
  "error_message": "Aucune page Facebook trouvée",
  "action_context": "connecting_facebook_page",
  "browser_info": {
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0...",
    "platform": "iPhone",
    "screenSize": "390x844"
  },
  "facebook_response": {
    "data": [],
    "paging": {}
  },
  "permissions_granted": ["email", "public_profile"],
  "permissions_denied": ["pages_show_list"],
  "console_logs": [
    "📥 Réponse Facebook Login Button: {...}",
    "⚠️ /me/accounts vide",
    "❌ Aucune page accessible"
  ]
}
```

Ceci vous permettra de voir exactement pourquoi votre client n'arrive pas à connecter sa page Facebook!

