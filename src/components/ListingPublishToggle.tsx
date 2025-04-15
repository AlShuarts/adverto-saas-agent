
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type ListingPublishToggleProps = {
  listing: Tables<"listings">;
};

export const ListingPublishToggle = ({ listing }: ListingPublishToggleProps) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const queryClient = useQueryClient();

  const handleTogglePublished = async () => {
    try {
      setIsPublishing(true);
      
      const { error } = await supabase
        .from("listings")
        .update({ is_published: !listing.is_published })
        .eq("id", listing.id);
      
      if (error) {
        throw error;
      }
      
      toast.success(
        listing.is_published 
          ? "Le listing a été retiré des listings publiés" 
          : "Le listing a été ajouté aux listings publiés !"
      );
      
      queryClient.invalidateQueries({ queryKey: ["listings"] });
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full mb-2">
      <Checkbox 
        id={`publish-${listing.id}`}
        checked={!!listing.is_published}
        onCheckedChange={handleTogglePublished}
        disabled={isPublishing}
      />
      <label 
        htmlFor={`publish-${listing.id}`}
        className="text-sm font-medium cursor-pointer"
      >
        {listing.is_published ? "Listing publié" : "Ajouter aux listings publiés"}
      </label>
    </div>
  );
};
