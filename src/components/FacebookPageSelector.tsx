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

export interface FacebookPage {
  id: string;
  name: string;
  access_token?: string;
  category?: string;
  tasks?: string[];
  origin?: string;
  role?: string;
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

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Sélectionnez votre page Facebook</DialogTitle>
          <DialogDescription>
            Choisissez la page Facebook que vous souhaitez connecter.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3">
            {pages.map((page) => {
              const isSelected = selectedPageId === page.id;
              
              return (
                <div
                  key={page.id}
                  onClick={() => setSelectedPageId(page.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium">{page.name}</h4>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      
                      {page.category && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {page.category}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {page.origin === 'assigned' && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                            Business Manager
                          </Badge>
                        )}
                        
                        {page.tasks?.includes('MANAGE') && (
                          <Badge variant="outline" className="text-xs">
                            MANAGE
                          </Badge>
                        )}
                        {page.tasks?.includes('CREATE_CONTENT') && (
                          <Badge variant="outline" className="text-xs">
                            CREATE_CONTENT
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
