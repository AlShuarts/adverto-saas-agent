
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTemplates = () => {
  const [facebookTemplates, setFacebookTemplates] = useState<{ id: string; name: string; content?: string }[]>([]);
  const [instagramTemplates, setInstagramTemplates] = useState<{ id: string; name: string }[]>([]);
  const [selectedFacebookTemplateId, setSelectedFacebookTemplateId] = useState<string>("none");
  const [selectedInstagramTemplateId, setSelectedInstagramTemplateId] = useState<string>("none");

  const fetchTemplates = useCallback(async () => {
    const { data: fbTemplates, error: fbError } = await supabase
      .from('facebook_templates')
      .select('id, name, content');
    
    if (!fbError && fbTemplates) {
      setFacebookTemplates(fbTemplates);
    }
    
    const { data: igTemplates, error: igError } = await supabase
      .from('instagram_templates')
      .select('id, name');
    
    if (!igError && igTemplates) {
      setInstagramTemplates(igTemplates);
    }
  }, []);

  const resetTemplates = useCallback(() => {
    setSelectedFacebookTemplateId("none");
    setSelectedInstagramTemplateId("none");
  }, []);

  return {
    facebookTemplates,
    instagramTemplates,
    selectedFacebookTemplateId,
    selectedInstagramTemplateId,
    setSelectedFacebookTemplateId,
    setSelectedInstagramTemplateId,
    fetchTemplates,
    resetTemplates
  };
};
