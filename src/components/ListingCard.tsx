
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { formatPrice } from "@/utils/priceFormatter";
import { Button } from "@/components/ui/button";
import { Video, Tag, Share, MoreHorizontal, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateSlideshowDialog } from "./CreateSlideshowDialog";
import { SlideshowStatus } from "./SlideshowStatus";
import { CreateSoldBannerDialog } from "./CreateSoldBannerDialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

type ListingCardProps = {
  listing: Tables<"listings">;
};

export const ListingCard = ({ listing }: ListingCardProps) => {
  const [showSlideshowDialog, setShowSlideshowDialog] = useState(false);
  const [showSoldBannerDialog, setShowSoldBannerDialog] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [expanded, setExpanded] = useState(false);
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

  if (!listing.images || listing.images.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <img 
            src={listing.images[0]} 
            alt={listing.title} 
            className="w-full h-36 object-cover"
          />
        </div>
        <div className="p-3 space-y-1">
          <div className="flex justify-between items-start">
            <h3 className="text-base font-semibold truncate">{listing.title}</h3>
            {listing.is_published && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 flex items-center gap-1 text-xs px-1.5 py-0.5">
                <CheckCircle2 className="h-3 w-3" />
                Publié
              </Badge>
            )}
          </div>
          <p className="text-lg font-bold text-white">
            {formatPrice(listing.price)}
          </p>
          <p className="text-xs text-muted-foreground truncate">{listing.address}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{listing.bedrooms} ch.</span>
            <span>{listing.bathrooms} sdb.</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between w-full py-1">
          <div className="flex items-center gap-1">
            <Checkbox 
              id={`publish-${listing.id}`}
              checked={!!listing.is_published}
              onCheckedChange={handleTogglePublished}
              disabled={isPublishing}
            />
            <label 
              htmlFor={`publish-${listing.id}`}
              className="text-xs font-medium cursor-pointer"
            >
              {listing.is_published ? "Publié" : "Publier"}
            </label>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        
        {expanded && (
          <div className="pt-1 border-t border-border grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSlideshowDialog(true)}
              className="flex items-center gap-1 text-xs"
            >
              <Video className="h-3 w-3" />
              <span>Diaporama</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSoldBannerDialog(true)}
              className="flex items-center gap-1 text-xs"
            >
              <Tag className="h-3 w-3" />
              <span>Bannière</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-xs"
                >
                  <Share className="h-3 w-3" />
                  <span>Partager</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Share className="h-4 w-4 mr-2" />
                  Facebook
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="h-4 w-4 mr-2" />
                  Instagram
                </DropdownMenuItem>
                {listing.is_published && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = "/published-listings"}>
                      Voir dans les listings publiés
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <SlideshowStatus listing={listing} className="col-span-3 mt-1" />
          </div>
        )}
      </CardFooter>

      <CreateSlideshowDialog
        listing={listing}
        isOpen={showSlideshowDialog}
        onClose={() => setShowSlideshowDialog(false)}
      />
      
      <CreateSoldBannerDialog
        listing={listing}
        isOpen={showSoldBannerDialog}
        onClose={() => setShowSoldBannerDialog(false)}
      />
    </Card>
  );
};
