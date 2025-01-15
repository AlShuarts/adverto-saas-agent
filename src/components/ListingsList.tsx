import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "./ListingCard";

export const ListingsList = () => {
  const { data: listings, isLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[400px] rounded-lg bg-muted animate-pulse"
          />
        ))}
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
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
};