import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, ImageOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/utils/priceFormatter";
import { Skeleton } from "@/components/ui/skeleton";

type RecentListingsProps = {
  refreshTrigger?: number;
};

export const RecentListings = ({ refreshTrigger }: RecentListingsProps) => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Tables<"listings">[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchRecentListings();
  }, [refreshTrigger]);

  const fetchRecentListings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get count first
      const { count } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setTotalCount(count || 0);

      // Get recent listings
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Vos annonces récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (listings.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Vos annonces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-2">Aucune annonce pour le moment</p>
            <p className="text-sm text-muted-foreground">
              Importez votre première annonce depuis Centris.ca
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2 flex-wrap">
          <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          <span className="truncate">Vos annonces récentes</span>
          <span className="text-xs sm:text-sm font-normal text-muted-foreground whitespace-nowrap">
            ({totalCount} au total)
          </span>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/listings")} className="gap-1 self-end sm:self-auto shrink-0">
          <span className="text-xs sm:text-sm">Voir tout</span>
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {listings.map((listing) => (
            <button
              key={listing.id}
              onClick={() => navigate("/listings")}
              className="group relative aspect-square rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all"
            >
              {listing.images && listing.images[0] ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageOff className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-xs text-white font-medium truncate">
                  {listing.city || "Ville inconnue"}
                </p>
                {listing.price && (
                  <p className="text-xs text-primary font-bold">
                    {formatPrice(listing.price)}
                  </p>
                )}
              </div>
              {listing.is_sold && (
                <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  VENDU
                </div>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
