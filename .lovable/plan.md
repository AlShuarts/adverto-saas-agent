
# Plan: Optimisation mobile complète de l'application

## Objectif
S'assurer que tous les éléments de l'application sont correctement formatés sur mobile, notamment que les textes ne débordent pas de leurs conteneurs.

## Problèmes identifiés

### 1. Sidebar non responsive sur mobile
**Fichier**: `src/components/layout/AppSidebar.tsx`
- La sidebar reste visible avec une largeur fixe sur mobile, réduisant l'espace disponible pour le contenu
- **Solution**: Transformer la sidebar en menu hamburger sur mobile

### 2. Onglets qui débordent sur la page Listings
**Fichier**: `src/pages/Listings.tsx` (lignes 108-115)
- Les onglets "Toutes", "Publiées", "Non publiées", "Vendues" débordent horizontalement
- **Solution**: Utiliser `overflow-x-auto` et réduire la taille du texte sur mobile

### 3. Onglets du profil qui débordent
**Fichier**: `src/pages/Profile.tsx` (lignes 160-173)
- Les onglets "Informations", "Templates", "Bannière" peuvent déborder
- **Solution**: Ajouter scroll horizontal et texte plus petit sur mobile

### 4. Détails des annonces sans troncature
**Fichier**: `src/components/ListingDetails.tsx`
- Les titres et adresses longues peuvent déborder
- **Solution**: Ajouter `truncate` ou `line-clamp` aux textes

### 5. En-tête des annonces récentes
**Fichier**: `src/components/dashboard/RecentListings.tsx` (lignes 99-110)
- Le titre avec le compteur peut déborder
- **Solution**: Rendre le header responsive avec flex-wrap

### 6. Cartes de stats avec texte long
**Fichier**: `src/components/dashboard/DashboardStats.tsx` (lignes 77-92)
- Les labels comme "Diaporamas créés" peuvent déborder sur petit écran
- **Solution**: Réduire la taille du texte et ajouter troncature

### 7. Boutons de navigation de step
**Fichier**: `src/components/action-selection/steps/StepNavigation.tsx`
- Les boutons "Précédent", "Annuler", "Suivant" peuvent se chevaucher
- **Solution**: Icônes seules sur mobile, texte + icône sur desktop

### 8. Sélecteur d'images - titres de cartes
**Fichier**: `src/components/action-selection/steps/MediaStep.tsx` (lignes 137-144, 166-171)
- Les titres "Sélection Facebook" et "Sélection Instagram" avec compteurs peuvent déborder
- **Solution**: Stack vertical sur mobile pour le titre et le compteur

### 9. Input d'import avec placeholder long
**Fichier**: `src/components/dashboard/QuickImport.tsx`
- Le placeholder "Collez l'URL Centris ici..." peut être coupé
- **Solution**: Placeholder plus court sur mobile

### 10. Cartes de connexion Facebook/Instagram
**Fichier**: `src/components/dashboard/ConnectionStatus.tsx` (lignes 43-97)
- Les noms de pages et boutons peuvent se chevaucher
- **Solution**: Layout vertical sur très petits écrans

---

## Modifications détaillées

### Fichier 1: `src/components/layout/AppSidebar.tsx`

Ajouter un menu hamburger sur mobile:
- Utiliser `useIsMobile()` pour détecter mobile
- Sur mobile: afficher un bouton hamburger en haut
- La sidebar devient un drawer/sheet qui s'ouvre au clic
- Sur desktop: garder le comportement actuel

### Fichier 2: `src/components/layout/MainLayout.tsx`

Adapter le layout pour le menu mobile:
- Ajouter un header mobile avec le bouton hamburger
- Le contenu prend toute la largeur sur mobile

### Fichier 3: `src/pages/Listings.tsx`

```tsx
// Ligne 108-115: Wrapper scrollable pour les tabs
<div className="overflow-x-auto -mx-2 px-2">
  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
    <TabsList className="min-w-max">
      <TabsTrigger value="all" className="text-xs sm:text-sm">Toutes</TabsTrigger>
      <TabsTrigger value="published" className="text-xs sm:text-sm">Publiées</TabsTrigger>
      <TabsTrigger value="unpublished" className="text-xs sm:text-sm whitespace-nowrap">Non publiées</TabsTrigger>
      <TabsTrigger value="sold" className="text-xs sm:text-sm">Vendues</TabsTrigger>
    </TabsList>
  </Tabs>
</div>
```

### Fichier 4: `src/pages/Profile.tsx`

```tsx
// Ligne 160-173: Tabs scrollables
<div className="overflow-x-auto -mx-2 px-2">
  <TabsList className="min-w-max">
    <TabsTrigger value="profile" className="gap-1 sm:gap-2 text-xs sm:text-sm">
      <User className="h-3 w-3 sm:h-4 sm:w-4" />
      <span className="hidden xs:inline">Informations</span>
      <span className="xs:hidden">Infos</span>
    </TabsTrigger>
    ...
  </TabsList>
</div>
```

### Fichier 5: `src/components/ListingDetails.tsx`

```tsx
export const ListingDetails = ({ listing }: ListingDetailsProps) => {
  return (
    <div className="p-4 space-y-2">
      <h3 className="text-base sm:text-lg font-semibold truncate">{listing.title}</h3>
      <p className="text-xl sm:text-2xl font-bold text-white">
        {formatPrice(listing.price)}
      </p>
      <p className="text-xs sm:text-sm text-muted-foreground truncate">{listing.address}</p>
      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
        <span>{listing.bedrooms} ch.</span>
        <span>{listing.bathrooms} sdb.</span>
      </div>
    </div>
  );
};
```

### Fichier 6: `src/components/dashboard/RecentListings.tsx`

```tsx
// Ligne 99-110: Header flexible
<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
  <CardTitle className="text-base sm:text-lg flex items-center gap-2 flex-wrap">
    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
    <span>Vos annonces récentes</span>
    <span className="text-xs sm:text-sm font-normal text-muted-foreground">
      ({totalCount} au total)
    </span>
  </CardTitle>
  <Button variant="ghost" size="sm" onClick={() => navigate("/listings")} className="gap-1 self-end sm:self-auto">
    <span className="text-xs sm:text-sm">Voir tout</span>
    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
  </Button>
</CardHeader>
```

### Fichier 7: `src/components/dashboard/DashboardStats.tsx`

```tsx
// Ligne 77-92: Cartes plus compactes sur mobile
<Card key={stat.label}>
  <CardContent className="p-3 sm:p-4">
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0">
        <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xl sm:text-2xl font-bold text-foreground">
          {loading ? "..." : stat.value}
        </p>
        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.label}</p>
      </div>
    </div>
  </CardContent>
</Card>
```

### Fichier 8: `src/components/action-selection/steps/StepNavigation.tsx`

```tsx
// Boutons plus compacts sur mobile
<Button
  type="button"
  variant="outline"
  onClick={onPrevious}
  className="flex items-center"
  size={isMobile ? "sm" : "default"}
>
  <ChevronLeft className="h-4 w-4" />
  <span className="hidden sm:inline ml-1">Précédent</span>
</Button>

// ...

<Button
  type="button"
  variant="outline"
  onClick={onCancel}
  size={isMobile ? "sm" : "default"}
>
  <span className="hidden sm:inline">Annuler</span>
  <X className="h-4 w-4 sm:hidden" />
</Button>
```

### Fichier 9: `src/components/action-selection/steps/MediaStep.tsx`

```tsx
// Ligne 137-144: Titre et compteur en stack vertical sur mobile
<CardTitle className="text-base sm:text-lg lg:text-xl text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
  <span className="flex items-center gap-2">
    <span className="text-blue-500">📘</span> 
    <span className="truncate">Sélection Facebook</span>
  </span>
  <span className={`text-xs sm:text-sm font-normal ${selectedFacebookImages.length >= 50 ? 'text-yellow-500' : 'text-gray-400'}`}>
    {selectedFacebookImages.length}/50 photos
  </span>
</CardTitle>
```

### Fichier 10: `src/components/dashboard/ConnectionStatus.tsx`

```tsx
// Layout plus flexible pour les cartes de connexion
<div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
  <div className="flex items-center gap-2 sm:gap-3">
    <div className={cn(
      "p-2 sm:p-2.5 rounded-lg shrink-0",
      facebookConnected ? "bg-green-500/20" : "bg-muted"
    )}>
      <Facebook className={cn(
        "h-4 w-4 sm:h-5 sm:w-5",
        facebookConnected ? "text-green-500" : "text-muted-foreground"
      )} />
    </div>
    <div className="min-w-0">
      <p className="text-sm sm:font-medium text-foreground">Facebook</p>
      <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-[150px]">
        {facebookConnected ? "Connecté" : "Non connecté"}
      </p>
    </div>
  </div>
  ...
</div>
```

---

## Fichiers à modifier

| Fichier | Type de modification |
|---------|---------------------|
| `src/components/layout/AppSidebar.tsx` | Menu hamburger mobile |
| `src/components/layout/MainLayout.tsx` | Header mobile |
| `src/pages/Listings.tsx` | Tabs scrollables |
| `src/pages/Profile.tsx` | Tabs scrollables |
| `src/components/ListingDetails.tsx` | Troncature texte |
| `src/components/dashboard/RecentListings.tsx` | Header flexible |
| `src/components/dashboard/DashboardStats.tsx` | Cartes compactes |
| `src/components/action-selection/steps/StepNavigation.tsx` | Boutons compacts |
| `src/components/action-selection/steps/MediaStep.tsx` | Titres flexibles |
| `src/components/dashboard/ConnectionStatus.tsx` | Layout flexible |
| `src/components/dashboard/QuickImport.tsx` | Placeholder court |

---

## Points techniques

1. **Utilisation cohérente de `useIsMobile()`** - Le hook existe déjà et est utilisé dans plusieurs composants

2. **Classes Tailwind responsive** - Utiliser les préfixes `sm:`, `md:`, `lg:` pour adapter les styles

3. **Propriétés de troncature**:
   - `truncate` pour couper le texte avec "..."
   - `line-clamp-2` pour limiter à 2 lignes
   - `whitespace-nowrap` pour empêcher les retours à la ligne
   - `min-w-0` sur les conteneurs flex pour permettre la troncature

4. **Scroll horizontal pour les tabs** - `overflow-x-auto` avec `min-w-max` sur le contenu

## Résultat attendu

Après ces modifications:
- L'application sera entièrement navigable sur mobile
- Aucun texte ne débordera de son conteneur
- Les boutons et interactions resteront accessibles
- La sidebar se transformera en menu hamburger sur mobile
