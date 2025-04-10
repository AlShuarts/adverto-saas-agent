
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ListingItem } from "./ListingItem";
import { ListingCard } from "./ListingCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const ListingsList = () => {
  const { data: listings, isLoading, refetch, isError, error } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      console.log("Fetching listings...");
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Fetched listings:", data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[300px] rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2 text-destructive">Erreur de chargement</h3>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "Une erreur est survenue lors du chargement des annonces"}
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  if (!listings?.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Aucune annonce</h3>
        <p className="text-muted-foreground">
          Importez votre première annonce Centris pour commencer
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <div key={listing.id} className="relative">
          <ListingCard listing={listing} />
        </div>
      ))}
    </div>
  );
};
