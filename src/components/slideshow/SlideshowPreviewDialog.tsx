
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { useListingText } from "@/hooks/useListingText";
import { useState, useEffect } from "react";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

// Import our new components
import { FacebookPreviewTab } from "./previews/FacebookPreviewTab";
import { InstagramPreviewTab } from "./previews/InstagramPreviewTab";
import { EditContentTab } from "./previews/EditContentTab";
import { SlideshowDialogFooter } from "./previews/SlideshowDialogFooter";

type SlideshowPreviewDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (message: string) => void;
  isPublishing: boolean;
  listing: Tables<"listings">;
  musicUrl: string | null;
};

export const SlideshowPreviewDialog = ({
  isOpen,
  onClose,
  onPublish,
  isPublishing,
  listing,
  musicUrl,
}: SlideshowPreviewDialogProps) => {
  const { generatedText, isLoading, error } = useListingText(listing, isOpen);
  const [editedText, setEditedText] = useState("");
  const [isPublishingToInstagram, setIsPublishingToInstagram] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const isMobile = useIsMobile();

  useEffect(() => {
    if (generatedText) {
      setEditedText(generatedText);
    }
  }, [generatedText]);

  const handleInstagramPublish = async () => {
    try {
      setIsPublishingToInstagram(true);
      
      const { data: slideshowData } = await supabase
        .from("slideshow_renders")
        .select("video_url")
        .eq("listing_id", listing.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const videoUrl = slideshowData?.video_url;

      if (!videoUrl) {
        toast.error("URL de la vidéo non disponible");
        throw new Error("URL de la vidéo non disponible");
      }

      await ensureAndIncrementStatistic('instagram');
      
      const { error } = await supabase.functions.invoke('instagram-publish', {
        body: {
          message: editedText,
          video: videoUrl,
          listingId: listing.id
        },
      });
      
      if (error) {
        toast.error("Erreur lors de la publication sur Instagram");
        throw error;
      }
      
      toast.success("Publication sur Instagram réussie");
      onClose();
    } catch (error) {
      console.error("Erreur lors de la publication sur Instagram:", error);
      toast.error("Erreur lors de la publication sur Instagram");
    } finally {
      setIsPublishingToInstagram(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-[90vw] max-h-[90vh] overflow-hidden">
        <DialogTitle className="text-xl mb-2">Prévisualisation du diaporama</DialogTitle>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 grid grid-cols-3 w-full">
            <TabsTrigger value="edit">Édition</TabsTrigger>
            <TabsTrigger value="facebook">Aperçu Facebook</TabsTrigger>
            <TabsTrigger value="instagram">Aperçu Instagram</TabsTrigger>
          </TabsList>
          
          <ScrollArea className={isMobile ? "h-[calc(80vh-12rem)]" : "h-[calc(85vh-12rem)]"}>
            <TabsContent value="edit" className="h-full pr-4">
              <EditContentTab
                listing={listing}
                musicUrl={musicUrl}
                isLoading={isLoading}
                editedText={editedText}
                setEditedText={setEditedText}
                error={error}
              />
            </TabsContent>
            
            <TabsContent value="facebook" className="pr-4">
              <FacebookPreviewTab
                editedText={editedText}
                listing={listing}
                musicUrl={musicUrl}
              />
            </TabsContent>
            
            <TabsContent value="instagram" className="pr-4">
              <InstagramPreviewTab
                editedText={editedText}
                listing={listing}
                musicUrl={musicUrl}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <DialogFooter>
          <SlideshowDialogFooter
            onClose={onClose}
            onPublish={onPublish}
            handleInstagramPublish={handleInstagramPublish}
            isPublishing={isPublishing}
            isPublishingToInstagram={isPublishingToInstagram}
            editedText={editedText}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
