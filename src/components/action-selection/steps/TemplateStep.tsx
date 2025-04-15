
import { TemplateSelector } from "../TemplateSelector";

type TemplateStepProps = {
  facebookTemplates: { id: string; name: string; content?: string }[];
  instagramTemplates: { id: string; name: string }[];
  selectedFacebookTemplateId: string;
  selectedInstagramTemplateId: string;
  setSelectedFacebookTemplateId: (id: string) => void;
  setSelectedInstagramTemplateId: (id: string) => void;
  generatedText: string;
  setGeneratedText: (text: string) => void;
  isGeneratingText: boolean;
  onGenerateText: () => void;
};

export const TemplateStep = ({
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
}: TemplateStepProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 2: Choisir un template et générer le texte</h3>
      
      <TemplateSelector 
        facebookTemplates={facebookTemplates}
        instagramTemplates={instagramTemplates}
        selectedFacebookTemplateId={selectedFacebookTemplateId}
        selectedInstagramTemplateId={selectedInstagramTemplateId}
        setSelectedFacebookTemplateId={setSelectedFacebookTemplateId}
        setSelectedInstagramTemplateId={setSelectedInstagramTemplateId}
        generatedText={generatedText}
        setGeneratedText={setGeneratedText}
        isGeneratingText={isGeneratingText}
        onGenerateText={onGenerateText}
      />
    </div>
  );
};
