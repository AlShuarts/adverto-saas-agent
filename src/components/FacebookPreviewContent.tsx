import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FacebookPreviewContentProps = {
  isLoading: boolean;
  error: string | null;
  generatedText: string;
  images: string[];
  onTextChange: (text: string) => void;
  selectedImages: string[];
  onSelectedImagesChange: (images: string[]) => void;
};

type Template = {
  id: string;
  name: string;
  content: string;
};

export const FacebookPreviewContent = ({
  isLoading,
  error,
  generatedText,
  images,
  onTextChange,
  selectedImages,
  onSelectedImagesChange,
}: FacebookPreviewContentProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('facebook_templates')
        .select('id, name, content');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates",
        variant: "destructive",
      });
    }
  };

  const handleImageSelect = (image: string) => {
    const isSelected = selectedImages.includes(image);
    
    if (isSelected) {
      onSelectedImagesChange(selectedImages.filter((i) => i !== image));
    } else {
      onSelectedImagesChange([...selectedImages, image]);
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
      fetchTemplates();
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

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onTextChange(template.content);
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
          <div className="flex justify-between items-center mb-2">
            <Select value={selectedTemplate || ""} onValueChange={handleTemplateChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Choisir un template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          {images.length > 0 && (
            <>
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-2 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-48 object-cover rounded"
                      />
                      <div className="absolute top-2 left-2">
                        <Checkbox
                          checked={selectedImages.includes(image)}
                          onCheckedChange={() => handleImageSelect(image)}
                        />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs">
                        {index + 1}/{images.length}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-sm text-muted-foreground mt-4">
                {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} sélectionnée{selectedImages.length !== 1 ? 's' : ''}
              </p>
            </>
          )}
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