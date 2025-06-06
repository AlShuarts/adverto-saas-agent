
import { TemplateSelector } from "../TemplateSelector";

type TemplateStepProps = {
  facebookTemplates: {
    id: string;
    name: string;
    content?: string;
  }[];
  instagramTemplates: {
    id: string;
    name: string;
  }[];
  selectedFacebookTemplateId: string;
  selectedInstagramTemplateId: string;
  setSelectedFacebookTemplateId: (id: string) => void;
  setSelectedInstagramTemplateId: (id: string) => void;
  generatedText: string;
  setGeneratedText: (text: string) => void;
  isGeneratingText: boolean;
  onGenerateText: () => Promise<void>;
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
  );
};
