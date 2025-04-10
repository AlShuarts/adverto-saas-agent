
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { formatPrice } from "@/utils/priceFormatter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Pencil, Trash, List, Grid, Filter } from "lucide-react";
import { Link } from "react-router-dom";

export const ListingsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSold, setShowSold] = useState(true);
  
  const { data: listings, isLoading } = useQuery({
    queryKey: ["all-listings", { searchTerm, showSold }],
    queryFn: async () => {
      console.log("Fetching all listings...");
      let query = supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!showSold) {
        query = query.eq("is_sold", false);
      }
      
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      console.log("Fetched all listings:", data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Rechercher un listing..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[300px]"
          />
        </div>
        
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="show-sold" 
              checked={showSold} 
              onCheckedChange={(checked) => setShowSold(!!checked)} 
            />
            <label htmlFor="show-sold" className="text-sm cursor-pointer">
              Afficher vendus
            </label>
          </div>
        </div>
      </div>

      {!listings?.length ? (
        <div className="text-center py-12 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">Aucun listing trouvé</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead className="text-right">Prix</TableHead>
                <TableHead>Détails</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="h-12 w-16 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-16 bg-muted rounded"></div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{listing.title}</TableCell>
                  <TableCell>{listing.address}, {listing.city}</TableCell>
                  <TableCell className="text-right">{formatPrice(listing.price)}</TableCell>
                  <TableCell>
                    {listing.bedrooms} ch. · {listing.bathrooms} sdb.
                  </TableCell>
                  <TableCell>
                    {listing.is_sold ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Vendu
                      </span>
                    ) : listing.is_published ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Publié
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Non publié
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={listing.centris_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
