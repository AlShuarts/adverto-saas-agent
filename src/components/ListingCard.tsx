import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { ListingImageCarousel } from "./ListingImageCarousel";
import { FacebookPublishButton } from "./FacebookPublishButton";
import { InstagramPublishButton } from "./InstagramPublishButton";
import { formatPrice } from "@/utils/priceFormatter";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Share, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { FacebookPreview } from "./FacebookPreview";
import { InstagramPreview } from "./InstagramPreview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CreateSlideshowDialog } from "./CreateSlideshowDialog";
import { SlideshowStatus } from "./SlideshowStatus";

type ListingCardProps = {
  listing: Tables<"listings">;
};

export const ListingCard = ({ listing }: ListingCardProps) => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [showFacebookPreview, setShowFacebookPreview] = useState(false);
  const [showInstagramPreview, setShowInstagramPreview] = useState(false);
  const [showSlideshowDialog, setShowSlideshowDialog] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("none");
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase
        .from('facebook_templates')
        .select('id, name');
      
      if (error) {
        console.error('Error fetching templates:', error);
        return;
      }
      
      setTemplates(data || []);
    };

    fetchTemplates();
  }, []);

  const handlePublishAttempt = () => {
    toast({
      title: "Connexion requise",
      description: "Connectez votre page Facebook depuis votre profil pour publier sur Facebook/Instagram",
    });
  };

  if (!listing.images || listing.images.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <ListingImageCarousel images={listing.images || []} />
        <div className="p-4 space-y-2">
          <h3 className="text-lg font-semibold">{listing.title}</h3>
          <p className="text-2xl font-bold text-white">
            {formatPrice(listing.price)}
          </p>
          <p className="text-sm text-muted-foreground">{listing.address}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{listing.bedrooms} ch.</span>
            <span>{listing.bathrooms} sdb.</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2 w-full">
        <div className="w-full grid grid-cols-1 gap-2">
          {profile?.facebook_page_id ? (
            <>
              <FacebookPublishButton listing={listing} />
              <InstagramPublishButton listing={listing} />
            </>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sélectionner un template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun template</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFacebookPreview(true)}
                  className="w-full"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Prévisualiser sur Facebook
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInstagramPreview(true)}
                className="w-full"
              >
                <Share className="w-4 h-4 mr-2" />
                Prévisualiser sur Instagram
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSlideshowDialog(true)}
            className="w-full"
          >
            <Video className="w-4 h-4 mr-2" />
            Créer un diaporama
          </Button>
          <SlideshowStatus listing={listing} />
        </div>
      </CardFooter>

      <FacebookPreview
        listing={listing}
        isOpen={showFacebookPreview}
        onClose={() => setShowFacebookPreview(false)}
        onPublish={handlePublishAttempt}
        selectedTemplateId={selectedTemplateId}
      />

      <InstagramPreview
        listing={listing}
        isOpen={showInstagramPreview}
        onClose={() => setShowInstagramPreview(false)}
        onPublish={handlePublishAttempt}
      />

      <CreateSlideshowDialog
        listing={listing}
        isOpen={showSlideshowDialog}
        onClose={() => setShowSlideshowDialog(false)}
      />
    </Card>
  );
};
