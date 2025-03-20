
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PublishedListingCard } from "./PublishedListingCard";

export const PublishedListingsList = () => {
  const { data: listings, isLoading } = useQuery({
    queryKey: ["published-listings"],
    queryFn: async () => {
      console.log("Fetching published listings...");
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Fetched published listings:", data);
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
        <h3 className="text-lg font-semibold mb-2">Aucune annonce publiée</h3>
        <p className="text-muted-foreground">
          Publiez vos annonces sur la page principale pour les voir ici
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <PublishedListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
};
