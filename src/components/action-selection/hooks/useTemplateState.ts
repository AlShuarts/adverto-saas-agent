
import { useState } from 'react';
import { Tables } from "@/integrations/supabase/types";
import { useTemplates } from './useTemplates';
import { useTextGeneration } from './useTextGeneration';

export const useTemplateState = (listing: Tables<"listings">) => {
  const {
    facebookTemplates,
    instagramTemplates,
    selectedFacebookTemplateId,
    selectedInstagramTemplateId,
    setSelectedFacebookTemplateId,
    setSelectedInstagramTemplateId,
    fetchTemplates,
    resetTemplates
  } = useTemplates();

  const {
    isGeneratingText,
    generatedText,
    setGeneratedText,
    generateText
  } = useTextGeneration(listing);

  return {
    facebookTemplates,
    instagramTemplates,
    selectedFacebookTemplateId,
    selectedInstagramTemplateId,
    setSelectedFacebookTemplateId,
    setSelectedInstagramTemplateId,
    resetTemplates,
    isGeneratingText,
    generatedText,
    setGeneratedText,
    generateText,
    fetchTemplates
  };
};
