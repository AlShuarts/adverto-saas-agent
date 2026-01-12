import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useFacebookTokenChecker } from "@/hooks/useFacebookTokenChecker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Grid3X3, List, Building2 } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/utils/priceFormatter";
import { ActionSelectionDialog } from "@/components/action-selection/ActionSelectionDialog";
import { Badge } from "@/components/ui/badge";

type ViewMode = "grid" | "list";
type FilterTab = "all" | "published" | "unpublished" | "sold";

const Listings = () => {
  useFacebookTokenChecker();
  const [listings, setListings] = useState<Tables<"listings">[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedListing, setSelectedListing] = useState<Tables<"listings"> | null>(null);
  const [showActionsDialog, setShowActionsDialog] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter((listing) => {
    // Search filter
    const matchesSearch = 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.address?.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab filter
    let matchesTab = true;
    switch (activeTab) {
      case "published":
        matchesTab = listing.is_published === true;
        break;
      case "unpublished":
        matchesTab = listing.is_published !== true;
        break;
      case "sold":
        matchesTab = listing.is_sold === true;
        break;
    }

    return matchesSearch && matchesTab;
  });

  const handleOpenActions = (listing: Tables<"listings">) => {
    setSelectedListing(listing);
    setShowActionsDialog(true);
  };

  const getStatusBadge = (listing: Tables<"listings">) => {
    if (listing.is_sold) {
      return <Badge variant="destructive" className="text-xs">Vendu</Badge>;
    }
    if (listing.is_published) {
      return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 text-xs">Publié</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">Non publié</Badge>;
  };

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Mes annonces
          </h1>
          <p className="text-muted-foreground mt-1">
            {listings.length} annonce{listings.length !== 1 ? "s" : ""} au total
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
            <TabsList>
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="published">Publiées</TabsTrigger>
              <TabsTrigger value="unpublished">Non publiées</TabsTrigger>
              <TabsTrigger value="sold">Vendues</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex border border-border rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "Aucune annonce ne correspond à votre recherche" : "Aucune annonce trouvée"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Photo</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      {listing.images?.[0] ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{listing.address || listing.title}</TableCell>
                    <TableCell>{listing.city || "-"}</TableCell>
                    <TableCell>{listing.price ? formatPrice(listing.price) : "-"}</TableCell>
                    <TableCell>{getStatusBadge(listing)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenActions(listing)}
                      >
                        Actions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Action Dialog */}
      {selectedListing && (
        <ActionSelectionDialog
          listing={selectedListing}
          isOpen={showActionsDialog}
          onClose={() => {
            setShowActionsDialog(false);
            setSelectedListing(null);
          }}
        />
      )}
    </MainLayout>
  );
};

export default Listings;
