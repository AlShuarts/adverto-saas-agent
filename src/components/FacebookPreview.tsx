import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { FacebookPreviewContent } from "./FacebookPreviewContent";
import { useListingText } from "@/hooks/useListingText";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

type FacebookPreviewProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
  onPublish: (message: string) => void;
};

export const FacebookPreview = ({
  listing,
  isOpen,
  onClose,
  onPublish,
}: FacebookPreviewProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("none");
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const { generatedText, isLoading, error } = useListingText(listing, isOpen, selectedTemplateId === "none" ? undefined : selectedTemplateId);
  const [editedText, setEditedText] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const displayImages = listing.images || [];

  useEffect(() => {
    if (generatedText) {
      setEditedText(generatedText);
    }
  }, [generatedText]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedImages([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase
        .from('facebook_templates')
        .select('id, name');
      
      if (error) {
        console.error('Error fetching templates:', error);
        return;
      }
      
      setTemplates(data || []);
    };

    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Prévisualisation Facebook</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="w-full">
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
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
          <FacebookPreviewContent
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
            >
              Annuler
            </button>
            <button
              onClick={() => onPublish(editedText)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={isLoading || selectedImages.length === 0}
            >
              Publier
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};