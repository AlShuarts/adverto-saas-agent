
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type TemplateSelectorProps = {
  facebookTemplates: { id: string; name: string; content?: string }[];
  instagramTemplates: { id: string; name: string }[];
  selectedFacebookTemplateId: string;
  selectedInstagramTemplateId: string;
  setSelectedFacebookTemplateId: (id: string) => void;
  setSelectedInstagramTemplateId: (id: string) => void;
  generatedText: string;
  setGeneratedText: (text: string) => void;
  isGeneratingText: boolean;
  onGenerateText: () => Promise<void>;
};

export const TemplateSelector = ({
  facebookTemplates,
  instagramTemplates,
  selectedFacebookTemplateId,
  selectedInstagramTemplateId,
  setSelectedFacebookTemplateId,
  setSelectedInstagramTemplateId,
  generatedText,
  setGeneratedText,
  isGeneratingText,
  onGenerateText
}: TemplateSelectorProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 2: Choisir un template et générer le texte</h3>
      
      <div className="space-y-4 border rounded-md p-4">
        <div>
          <Label htmlFor="facebook-template">Template Facebook (optionnel)</Label>
          <Select 
            value={selectedFacebookTemplateId} 
            onValueChange={setSelectedFacebookTemplateId}
          >
            <SelectTrigger id="facebook-template" className="mt-1">
              <SelectValue placeholder="Aucun template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun template</SelectItem>
              {facebookTemplates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="instagram-template">Template Instagram (optionnel)</Label>
          <Select 
            value={selectedInstagramTemplateId} 
            onValueChange={setSelectedInstagramTemplateId}
          >
            <SelectTrigger id="instagram-template" className="mt-1">
              <SelectValue placeholder="Aucun template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun template</SelectItem>
              {instagramTemplates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={onGenerateText} 
            disabled={isGeneratingText}
            className="w-full"
          >
            {isGeneratingText ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération en cours...
              </>
            ) : "Générer le texte de la publication"}
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="publication-text">Texte de la publication</Label>
        <Textarea
          id="publication-text"
          value={generatedText}
          onChange={(e) => setGeneratedText(e.target.value)}
          placeholder="Votre texte apparaîtra ici après génération"
          className="min-h-[150px]"
        />
      </div>
    </div>
  );
};
