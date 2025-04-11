
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { InstagramPreviewContent } from "./InstagramPreviewContent";
import { useListingText } from "@/hooks/useListingText";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

// Define Instagram template type since it's not in the generated types yet
type InstagramTemplate = {
  id: string;
  name: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type InstagramPreviewProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
  onPublish: (message: string, selectedImages: string[], templateId?: string) => void;
};

export const InstagramPreview = ({
  listing,
  isOpen,
  onClose,
  onPublish,
}: InstagramPreviewProps) => {
  const { generatedText, isLoading, error } = useListingText(listing, isOpen);
  const [editedText, setEditedText] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("none");
  const displayImages = listing.images || [];

  useEffect(() => {
    if (generatedText) {
      setEditedText(generatedText);
    }
  }, [generatedText]);

  useEffect(() => {
    if (isOpen && displayImages.length > 0) {
      setSelectedImages([displayImages[0]]);
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('instagram_templates' as any)
        .select('id, name');
      
      if (!error && data) {
        // Use proper type assertion with 'as'
        setTemplates(data as { id: string; name: string }[]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des templates Instagram:", error);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const templateId = selectedTemplateId === "none" ? undefined : selectedTemplateId;
      await onPublish(editedText, selectedImages, templateId);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prévisualisation Instagram</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!isLoading && (
            <div className="space-y-2">
              <Label htmlFor="instagram-template">Sélectionner un template (optionnel)</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger id="instagram-template">
                  <SelectValue placeholder="Sélectionner un template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun template</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <InstagramPreviewContent
            isLoading={isLoading}
            error={error}
            generatedText={editedText}
            images={displayImages}
            onTextChange={setEditedText}
            selectedImages={selectedImages}
            onSelectedImagesChange={setSelectedImages}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-100"
              disabled={isPublishing}
            >
              Annuler
            </button>
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2"
              disabled={isLoading || selectedImages.length === 0 || isPublishing}
            >
              {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
              Publier
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
