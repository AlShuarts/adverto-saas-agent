
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";

export const useTextGeneration = (listing: Tables<"listings">) => {
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [generatedText, setGeneratedText] = useState<string>("");

  const generateText = async (
    selectedTemplateId: string,
    templates: { id: string; name: string; content?: string }[]
  ) => {
    try {
      setIsGeneratingText(true);

      const { data, error } = await supabase.functions.invoke("generate-listing-description", {
        body: {
          listing: listing,
          templateId: selectedTemplateId === "none" ? undefined : selectedTemplateId,
          templateContent:
            selectedTemplateId !== "none"
              ? templates.find((t) => t.id === selectedTemplateId)?.content
              : undefined,
        },
      });

      if (error) throw new Error("Erreur lors de la génération du texte");

      setGeneratedText(data.text || "");
      await ensureAndIncrementStatistic("description");

      toast.success("Texte généré", {
        description: "Le texte de votre publication a été généré avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la génération du texte:", error);
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la génération du texte.",
      });
    } finally {
      setIsGeneratingText(false);
    }
  };

  return {
    isGeneratingText,
    generatedText,
    setGeneratedText,
    generateText,
  };
};
