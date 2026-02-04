

# Plan: Implémentation du Système de Rapports d'Erreurs

## État actuel
- ✅ Table `error_reports` déjà créée dans la base de données
- ❌ Hook `useErrorReport` manquant
- ❌ Edge function `report-error` manquante
- ❌ Intégration dans le code existant manquante
- ❌ Dashboard admin des erreurs manquant

---

## Fichiers à créer

### 1. Hook Frontend: `src/hooks/useErrorReport.ts`
Capture automatiquement le contexte des erreurs:
- Informations utilisateur (id, email, nom)
- Métadonnées navigateur (user agent, taille écran, timezone)
- Stack trace complet
- Réponses API Facebook brutes
- Permissions accordées/refusées

### 2. Edge Function: `supabase/functions/report-error/index.ts`
- Reçoit les rapports d'erreurs du frontend
- Insère dans la table `error_reports`
- Optionnel: envoie notification webhook (Slack/Discord)

### 3. Dashboard Admin: `src/pages/AdminErrors.tsx`
Interface pour visualiser et gérer les erreurs:
- Liste des erreurs avec filtres (type, statut, date)
- Détail complet de chaque erreur
- Actions: marquer comme résolu, ajouter notes

---

## Fichiers à modifier

### 4. `src/hooks/useProfile.tsx`
Intégrer le rapport d'erreurs dans les catch blocks:
- `handleFacebookLoginResponse()` (ligne ~290)
- `connectInstagram()` (ligne ~441)

### 5. `src/pages/Admin.tsx`
Ajouter un onglet/lien vers le dashboard des erreurs

### 6. `src/App.tsx`
Ajouter la route `/admin/errors`

### 7. `supabase/config.toml`
Configurer l'edge function `report-error`

---

## Détails techniques

### Hook useErrorReport
```typescript
// Capture automatique du contexte
const browserInfo = {
  userAgent: navigator.userAgent,
  language: navigator.language,
  platform: navigator.platform,
  screenSize: `${window.screen.width}x${window.screen.height}`,
  viewportSize: `${window.innerWidth}x${window.innerHeight}`,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

// Envoi via edge function
await supabase.functions.invoke('report-error', {
  body: { userId, errorType, errorMessage, browserInfo, ... }
});
```

### Intégration dans useProfile.tsx
```typescript
} catch (error) {
  console.error("❌ Erreur complète:", error);
  
  // NOUVEAU: Envoyer le rapport d'erreur
  await reportError(error, {
    errorType: 'facebook_connection',
    actionContext: 'connecting_facebook_page',
    facebookResponse: lastFacebookResponse,
  });
  
  toast({ title: "Erreur...", variant: "destructive" });
}
```

### Dashboard AdminErrors
- Tableau avec colonnes: Date, Utilisateur, Type, Message, Statut
- Filtres: par type d'erreur, par statut, par date
- Modal de détail avec toutes les infos (browser, stack, Facebook response)
- Actions: Marquer résolu, Ajouter note admin

---

## Informations capturées par erreur

| Donnée | Description |
|--------|-------------|
| user_id, user_email, user_name | Identité de l'utilisateur |
| error_type | 'facebook_connection', 'instagram_connection', 'import', etc. |
| error_message, error_stack | Message et trace complète |
| page_url | URL où l'erreur s'est produite |
| action_context | 'connecting_facebook', 'publishing_post', etc. |
| browser_info | User agent, taille écran, timezone |
| facebook_response | Réponse brute de l'API Facebook |
| permissions_granted/denied | Permissions Facebook accordées/refusées |

---

## Configuration optionnelle (webhook)
Si vous souhaitez recevoir des notifications en temps réel:
1. Créer un webhook Slack ou Discord
2. Ajouter le secret `ERROR_NOTIFICATION_WEBHOOK` dans Supabase

