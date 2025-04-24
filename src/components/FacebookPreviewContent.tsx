import { Loader2, Save, Copy, Images } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SlideshowPlayer } from "./slideshow/SlideshowPlayer";

type FacebookPreviewContentProps = {
  isLoading: boolean;
  error: string | null;
  generatedText: string;
  images: string[];
  onTextChange: (text: string) => void;
  selectedImages: string[];
  onSelectedImagesChange: (images: string[]) => void;
  slideshowUrl?: string | null;
  musicUrl?: string | null;
  showSlideshow?: boolean;
};

export const FacebookPreviewContent = ({
  isLoading,
  error,
  generatedText,
  images,
  onTextChange,
  selectedImages,
  onSelectedImagesChange,
  slideshowUrl,
  musicUrl,
  showSlideshow = false,
}: FacebookPreviewContentProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const handleImageSelect = (image: string) => {
    const isSelected = selectedImages.includes(image);
    
    if (isSelected) {
      onSelectedImagesChange(selectedImages.filter((i) => i !== image));
    } else {
      onSelectedImagesChange([...selectedImages, image]);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      toast({
        title: "Texte copié",
        description: "Le texte a été copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le texte",
        variant: "destructive",
      });
    }
  };

  const saveAsTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom pour le template",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      const { error: insertError } = await supabase
        .from('facebook_templates')
        .insert({
          user_id: user.id,
          name: templateName,
          content: generatedText
        });

      if (insertError) throw insertError;

      toast({
        title: "Template sauvegardé",
        description: "Votre template a été sauvegardé avec succès",
      });

      setIsTemplateDialogOpen(false);
      setTemplateName("");
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderMediaContent = () => {
    if (showSlideshow && slideshowUrl) {
      return (
        <div className="relative">
          <div className="aspect-video bg-black rounded-md overflow-hidden">
            <video 
              src={slideshowUrl} 
              className="w-full h-full object-cover"
              controls
              autoPlay
              muted
              loop
            />
          </div>
        </div>
      );
    } else if (selectedImages.length > 0) {
      return (
        <div className="relative">
          <div className="aspect-video bg-muted rounded-md overflow-hidden">
            <img
              src={selectedImages[0]}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          {selectedImages.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              +{selectedImages.length - 1} photo{selectedImages.length > 2 ? 's' : ''}
            </div>
          )}
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="glass border border-border/40 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full" />
        <div>
          <p className="font-semibold text-foreground">Votre Page Facebook</p>
          <p className="text-sm text-muted-foreground">Maintenant</p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex flex-col space-y-4">
            <div className="p-4 rounded-lg bg-card border">
              <div className="space-y-3">
                <p className="whitespace-pre-wrap text-sm">{generatedText}</p>
                {renderMediaContent()}
              </div>
              <div className="flex justify-between pt-3 mt-3 border-t text-sm text-muted-foreground">
                <span>J'aime</span>
                <span>Commenter</span>
                <span>Partager</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!generatedText}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copier le texte
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTemplateDialogOpen(true)}
                disabled={!generatedText}
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder comme template
              </Button>
            </div>
            
            <Textarea
              value={generatedText}
              onChange={(e) => onTextChange(e.target.value)}
              className="mb-4 min-h-[150px]"
              placeholder="Entrez votre texte ici..."
            />
            
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            
            {!showSlideshow && images && images.length > 0 && (
              <>
                <div className="mb-4 p-3 bg-secondary/10 rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    Sélectionnez les images à publier sur Facebook
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cliquez sur la case à cocher pour sélectionner/désélectionner une image
                  </p>
                </div>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((image, index) => (
                      <div 
                        key={index} 
                        className="relative group border-2 border-transparent hover:border-primary rounded-lg transition-all duration-200"
                      >
                        <img
                          src={image}
                          alt={`Image ${index + 1}`}
                          className="w-full h-48 object-cover rounded"
                        />
                        <div className="absolute top-2 left-2 bg-black/50 p-1.5 rounded">
                          <Checkbox
                            checked={selectedImages.includes(image)}
                            onCheckedChange={() => handleImageSelect(image)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs">
                          {index + 1}/{images.length}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <p className="text-sm text-muted-foreground mt-4 font-medium">
                  {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} sélectionnée{selectedImages.length !== 1 ? 's' : ''} sur {images.length}
                </p>
              </>
            )}
            {!showSlideshow && (!images || images.length === 0) && (
              <div className="flex flex-col items-center justify-center h-[200px] bg-muted/20 rounded p-8 text-center">
                <Images className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune image disponible</p>
                <p className="text-sm text-muted-foreground mt-2">Veuillez ajouter des images à cette propriété</p>
              </div>
            )}
          </div>
        </>
      )}

      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sauvegarder comme template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Nom du template"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveAsTemplate} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
