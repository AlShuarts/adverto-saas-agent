import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, AlertCircle, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useFacebookPageDiagnostics, type FacebookPage } from "@/hooks/useFacebookPageDiagnostics";

interface FacebookPageSelectorProps {
  open: boolean;
  pages: FacebookPage[];
  onSelect: (page: FacebookPage) => void;
  onCancel: () => void;
}

export const FacebookPageSelector = ({
  open,
  pages,
  onSelect,
  onCancel,
}: FacebookPageSelectorProps) => {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const { diagnosePages, diagnosePage } = useFacebookPageDiagnostics();

  const diagnostics = diagnosePages(pages);
  const compatibleCount = diagnostics.filter(d => d.status === 'compatible').length;
  const limitedCount = diagnostics.filter(d => d.status === 'limited').length;
  const incompatibleCount = diagnostics.filter(d => d.status === 'incompatible').length;

  const handleConfirm = () => {
    const page = pages.find(p => p.id === selectedPageId);
    if (page) {
      onSelect(page);
    }
  };

  const getStatusIcon = (status: 'compatible' | 'limited' | 'incompatible') => {
    switch (status) {
      case 'compatible':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'limited':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'incompatible':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: 'compatible' | 'limited' | 'incompatible') => {
    switch (status) {
      case 'compatible':
        return <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">✓ Compatible</Badge>;
      case 'limited':
        return <Badge variant="secondary" className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white">⚠ Limité</Badge>;
      case 'incompatible':
        return <Badge variant="destructive" className="text-xs">✗ Incompatible</Badge>;
    }
  };

  const selectedDiagnostic = selectedPageId 
    ? diagnostics.find(d => d.page.id === selectedPageId)
    : null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Sélectionnez votre page Facebook</DialogTitle>
          <DialogDescription>
            Choisissez la page Facebook que vous souhaitez connecter. Certaines pages peuvent avoir des permissions limitées.
          </DialogDescription>
        </DialogHeader>

        {/* Résumé des pages */}
        {pages.length > 1 && (
          <div className="flex gap-2 text-sm">
            <span className="text-muted-foreground">
              {pages.length} page{pages.length > 1 ? 's' : ''} trouvée{pages.length > 1 ? 's' : ''} :
            </span>
            {compatibleCount > 0 && (
              <span className="text-green-600 font-medium">
                {compatibleCount} compatible{compatibleCount > 1 ? 's' : ''}
              </span>
            )}
            {limitedCount > 0 && (
              <span className="text-yellow-600 font-medium">
                {limitedCount} limitée{limitedCount > 1 ? 's' : ''}
              </span>
            )}
            {incompatibleCount > 0 && (
              <span className="text-red-600 font-medium">
                {incompatibleCount} incompatible{incompatibleCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3">
            {diagnostics.map((diagnostic) => {
              const isSelected = selectedPageId === diagnostic.page.id;
              
              return (
                <div key={diagnostic.page.id}>
                  <div
                    onClick={() => setSelectedPageId(diagnostic.page.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    } ${diagnostic.status === 'incompatible' ? 'opacity-70' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getStatusIcon(diagnostic.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium">{diagnostic.page.name}</h4>
                          {isSelected && (
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        
                        {diagnostic.page.category && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {diagnostic.page.category}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {getStatusBadge(diagnostic.status)}
                          
                          {diagnostic.page.origin === 'assigned' && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Business
                            </Badge>
                          )}
                          
                          {diagnostic.hasManagePermission && (
                            <Badge variant="outline" className="text-xs">
                              MANAGE
                            </Badge>
                          )}
                          {diagnostic.hasCreateContentPermission && (
                            <Badge variant="outline" className="text-xs">
                              CREATE_CONTENT
                            </Badge>
                          )}
                        </div>

                        {diagnostic.issues.length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {diagnostic.issues[0]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isSelected && diagnostic.suggestions.length > 0 && (
                    <Alert className="mt-2 border-yellow-600/20 bg-yellow-50/50 dark:bg-yellow-950/20">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-sm">
                        <p className="font-medium mb-1">💡 Recommandation :</p>
                        <p>{diagnostic.suggestions[0]}</p>
                        {diagnostic.status === 'incompatible' && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 mt-2 text-yellow-700 dark:text-yellow-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open('https://www.facebook.com/settings?tab=page_roles', '_blank');
                            }}
                          >
                            Ouvrir les paramètres de la page
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {selectedDiagnostic?.status === 'incompatible' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Cette page n'a pas les permissions nécessaires. Vous pouvez la connecter, mais la publication pourrait échouer.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center gap-2 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.open('https://www.facebook.com/settings?tab=page_roles', '_blank');
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Gérer les permissions
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedPageId}
            >
              Connecter cette page
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
