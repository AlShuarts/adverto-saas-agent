import { useToast } from "@/hooks/use-toast";

export interface FacebookPage {
  id: string;
  name: string;
  category?: string;
  tasks?: string[];
  permitted_tasks?: string[];
  access_token?: string;
  origin?: 'accounts' | 'assigned' | 'business';
  role?: string;
  perms?: string[];
}

export interface PageDiagnostic {
  page: FacebookPage;
  isCompatible: boolean;
  hasManagePermission: boolean;
  hasCreateContentPermission: boolean;
  status: 'compatible' | 'limited' | 'incompatible';
  issues: string[];
  suggestions: string[];
}

export const useFacebookPageDiagnostics = () => {
  const { toast } = useToast();

  const diagnosePage = (page: FacebookPage): PageDiagnostic => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Normaliser tasks depuis permitted_tasks si nécessaire
    const allTasks = page.tasks || page.permitted_tasks || [];
    
    const hasManagePermission = allTasks.includes('MANAGE') || false;
    const hasCreateContentPermission = allTasks.includes('CREATE_CONTENT') || false;
    const hasAnalyzePermission = allTasks.includes('ANALYZE') || false;
    const hasModeratePermission = allTasks.includes('MODERATE') || false;
    const hasAdvertisePermission = allTasks.includes('ADVERTISE') || false;

    // Vérifier si la page a des permissions suffisantes
    const isCompatible = hasManagePermission || hasCreateContentPermission;

    if (!hasManagePermission && !hasCreateContentPermission) {
      issues.push("Aucune permission de gestion ou de création de contenu");
      suggestions.push("Vous devez avoir l'accès 'Contrôle total' ou 'Créateur de contenu' sur cette page Facebook");
      suggestions.push("Allez dans les paramètres de votre page Facebook > Rôles de la Page > Ajoutez-vous avec le rôle approprié");
    } else if (!hasManagePermission && hasCreateContentPermission) {
      issues.push("Permissions limitées au contenu uniquement");
      suggestions.push("Considérez demander l'accès 'Contrôle total' pour toutes les fonctionnalités");
    }

    // Déterminer le statut
    let status: 'compatible' | 'limited' | 'incompatible';
    if (!isCompatible) {
      status = 'incompatible';
    } else if (hasManagePermission) {
      status = 'compatible';
    } else {
      status = 'limited';
    }

    return {
      page,
      isCompatible,
      hasManagePermission,
      hasCreateContentPermission,
      status,
      issues,
      suggestions
    };
  };

  const diagnosePages = (pages: FacebookPage[]): PageDiagnostic[] => {
    return pages.map(diagnosePage);
  };

  const getCompatiblePages = (pages: FacebookPage[]): FacebookPage[] => {
    return diagnosePages(pages)
      .filter(d => d.isCompatible)
      .map(d => d.page);
  };

  const showPermissionError = (diagnostic: PageDiagnostic) => {
    const message = diagnostic.suggestions.length > 0
      ? diagnostic.suggestions[0]
      : "Cette page n'a pas les permissions nécessaires";

    toast({
      title: "Permissions insuffisantes",
      description: message,
      variant: "destructive",
    });
  };

  const showDetailedDiagnostic = (diagnostics: PageDiagnostic[]) => {
    console.group("🔍 Diagnostic détaillé des pages Facebook");
    
    diagnostics.forEach((diagnostic, index) => {
      console.log(`\n📄 Page ${index + 1}: ${diagnostic.page.name}`);
      console.log(`   ID: ${diagnostic.page.id}`);
      console.log(`   Catégorie: ${diagnostic.page.category || 'Non spécifiée'}`);
      console.log(`   Statut: ${diagnostic.status.toUpperCase()}`);
      console.log(`   Compatible: ${diagnostic.isCompatible ? '✅ Oui' : '❌ Non'}`);
      console.log(`   Permissions:`, {
        MANAGE: diagnostic.hasManagePermission ? '✅' : '❌',
        CREATE_CONTENT: diagnostic.hasCreateContentPermission ? '✅' : '❌',
        tasks_disponibles: diagnostic.page.tasks || []
      });
      
      if (diagnostic.issues.length > 0) {
        console.log(`   ⚠️ Problèmes:`);
        diagnostic.issues.forEach(issue => console.log(`      - ${issue}`));
      }
      
      if (diagnostic.suggestions.length > 0) {
        console.log(`   💡 Suggestions:`);
        diagnostic.suggestions.forEach(suggestion => console.log(`      - ${suggestion}`));
      }
    });
    
    console.groupEnd();
  };

  const getErrorMessageForPage = (page: FacebookPage): string => {
    const diagnostic = diagnosePage(page);
    
    if (diagnostic.status === 'incompatible') {
      return (
        "Cette page n'a pas les permissions nécessaires pour publier du contenu.\n\n" +
        "📋 Solution :\n" +
        "1. Allez dans les paramètres de votre page Facebook\n" +
        "2. Cliquez sur 'Rôles de la Page'\n" +
        "3. Ajoutez-vous avec le rôle 'Administrateur' ou 'Éditeur'\n" +
        "4. Réessayez la connexion"
      );
    }
    
    if (diagnostic.status === 'limited') {
      return (
        "Cette page a des permissions limitées. Certaines fonctionnalités pourraient ne pas fonctionner.\n\n" +
        "💡 Recommandation : Demandez l'accès 'Contrôle total' pour une meilleure expérience."
      );
    }
    
    return "";
  };

  return {
    diagnosePage,
    diagnosePages,
    getCompatiblePages,
    showPermissionError,
    showDetailedDiagnostic,
    getErrorMessageForPage
  };
};
