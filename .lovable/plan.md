
# Plan: Implémentation du Système de Rapports d'Erreurs

## État actuel
- ✅ Table `error_reports` déjà créée dans la base de données
- ✅ Hook `useErrorReport` créé
- ✅ Edge function `report-error` créée et déployée
- ✅ Intégration dans useProfile.tsx (Facebook + Instagram)
- ✅ Dashboard admin des erreurs créé

---

## Fichiers créés

### 1. Hook Frontend: `src/hooks/useErrorReport.ts`
- Capture automatique du contexte (browser, user, permissions)
- Capture des logs console récents
- Fonction `reportErrorStandalone` pour usage hors composants

### 2. Edge Function: `supabase/functions/report-error/index.ts`
- Reçoit les rapports d'erreurs du frontend
- Insère dans la table `error_reports`
- Support optionnel de webhook (Slack/Discord) via `ERROR_NOTIFICATION_WEBHOOK`

### 3. Dashboard Admin: `src/pages/AdminErrors.tsx`
- Liste des erreurs avec filtres (type, statut, date)
- Détail complet de chaque erreur (browser, stack, Facebook response)
- Actions: marquer comme résolu, ajouter notes admin

---

## Fichiers modifiés

### 4. `src/hooks/useProfile.tsx`
- Intégration dans `handleFacebookLoginResponse()` catch block
- Intégration dans `connectInstagram()` catch block
- Capture des permissions Facebook accordées/refusées

### 5. `src/pages/Admin.tsx`
- Ajout du bouton "Erreurs" vers `/admin/errors`

### 6. `src/App.tsx`
- Route `/admin/errors` ajoutée
- Setup du capture des logs console au démarrage

### 7. `supabase/config.toml`
- Configuration de l'edge function `report-error` (verify_jwt = false)

---

## Informations capturées par erreur

| Donnée | Description |
|--------|-------------|
| user_id, user_email, user_name | Identité de l'utilisateur |
| error_type | 'facebook_connection', 'instagram_connection', etc. |
| error_message, error_stack | Message et trace complète |
| page_url | URL où l'erreur s'est produite |
| action_context | 'connecting_facebook_page', 'connecting_instagram_account', etc. |
| browser_info | User agent, taille écran, timezone, online status |
| facebook_response | Réponse brute de l'API Facebook |
| permissions_granted/denied | Permissions Facebook accordées/refusées |
| console_logs | 20 derniers logs de la console |

---

## Configuration optionnelle (webhook)
Pour recevoir des notifications en temps réel:
1. Créer un webhook Slack ou Discord
2. Ajouter le secret `ERROR_NOTIFICATION_WEBHOOK` dans Supabase Functions Secrets
