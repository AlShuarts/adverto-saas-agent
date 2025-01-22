import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useVideoGeneration = (listingId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateVideo = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-slideshow', {
        body: { listingId }
      });

      if (error) throw error;

      if (data?.url) {
        const { error: updateError } = await supabase
          .from('listings')
          .update({ video_url: data.url })
          .eq('id', listingId);

        if (updateError) throw updateError;

        queryClient.invalidateQueries({ queryKey: ["listings"] });
        
        toast({
          title: "Succès",
          description: "La vidéo a été générée avec succès",
        });

        return data.url;
      }
    } catch (error) {
      console.error('Erreur lors de la création de la vidéo:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la vidéo",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateVideo,
    isLoading
  };
};