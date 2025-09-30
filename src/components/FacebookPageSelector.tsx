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
import { Check } from "lucide-react";

interface FacebookPage {
  id: string;
  name: string;
  category?: string;
  tasks?: string[];
  access_token: string;
}

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

  const handleConfirm = () => {
    const page = pages.find(p => p.id === selectedPageId);
    if (page) {
      onSelect(page);
    }
  };

  const hasFullControl = (page: FacebookPage) => {
    return page.tasks?.includes('MANAGE') || page.tasks?.includes('CREATE_CONTENT');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Sélectionnez votre page Facebook</DialogTitle>
          <DialogDescription>
            Choisissez la page Facebook que vous souhaitez connecter à l'application.
            Vous devez avoir un accès administrateur complet à la page.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-2">
            {pages.map((page) => {
              const fullControl = hasFullControl(page);
              
              return (
                <div
                  key={page.id}
                  onClick={() => setSelectedPageId(page.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPageId === page.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  } ${!fullControl ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{page.name}</h4>
                        {selectedPageId === page.id && (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      
                      {page.category && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {page.category}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {fullControl ? (
                          <Badge variant="default" className="text-xs">
                            Accès complet
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Accès insuffisant
                          </Badge>
                        )}
                        
                        {page.tasks && page.tasks.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {page.tasks.join(', ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-4">
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
      </DialogContent>
    </Dialog>
  );
};
