
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SlideshowPlayer } from "./SlideshowPlayer";
import { Tables } from "@/integrations/supabase/types";
import { useListingText } from "@/hooks/useListingText";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Facebook, Instagram } from "lucide-react";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  useEffect(() => {
    if (generatedText) {
      setEditedText(generatedText);
    }
  }, [generatedText]);

  const handleInstagramPublish = async () => {
    try {
      setIsPublishingToInstagram(true);
      
      // Récupérer l'URL de la vidéo du diaporama
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

      // Incrémenter les statistiques pour Instagram
      await ensureAndIncrementStatistic('instagram');
      
      const { error } = await supabase.functions.invoke('instagram-publish', {
        body: {
          message: editedText,
          images: [videoUrl], // Nous passons l'URL de la vidéo comme image (l'API Instagram traitera la première comme une vidéo si c'est une URL de vidéo)
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

  // Composant pour prévisualiser Facebook
  const FacebookPreview = () => (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center space-x-2 border-b pb-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full" />
        <div>
          <p className="font-semibold">Votre Page Facebook</p>
          <p className="text-xs text-gray-500">Maintenant</p>
        </div>
      </div>
      <div className="py-3">
        <p className="text-sm whitespace-pre-wrap mb-3">{editedText}</p>
        <div className="aspect-video bg-black rounded-md overflow-hidden">
          {listing.images && listing.images.length > 0 && (
            <img
              src={listing.images[0]}
              alt="Propriété"
              className="w-full h-full object-cover"
            />
          )}
          {listing.images && listing.images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              +{listing.images.length - 1} photos
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between border-t pt-3 text-sm text-gray-500">
        <span>J'aime</span>
        <span>Commenter</span>
        <span>Partager</span>
      </div>
    </div>
  );

  // Composant pour prévisualiser Instagram
  const InstagramPreview = () => (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center space-x-2 border-b pb-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-700 rounded-full flex items-center justify-center">
          <Instagram className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold">Votre Compte Instagram</p>
          <p className="text-xs text-gray-500">Maintenant</p>
        </div>
      </div>
      <div className="py-3">
        {listing.images && listing.images.length > 0 && (
          <div className="aspect-square bg-black rounded-md overflow-hidden mb-3">
            <img
              src={listing.images[0]} 
              alt="Propriété"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex space-x-4 py-2">
          <div className="flex space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
        </div>
        <p className="font-semibold text-sm mt-1">0 J'aime</p>
        <div className="mt-1">
          <span className="font-semibold text-sm">Votre Compte</span>{" "}
          <span className="text-sm whitespace-pre-wrap">{editedText}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[85vw] w-[85vw] max-h-[85vh] overflow-hidden">
        <DialogTitle className="text-xl mb-2">Prévisualisation du diaporama</DialogTitle>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 grid grid-cols-3 w-full">
            <TabsTrigger value="edit">Édition</TabsTrigger>
            <TabsTrigger value="facebook">Aperçu Facebook</TabsTrigger>
            <TabsTrigger value="instagram">Aperçu Instagram</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="h-[calc(85vh-12rem)] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {/* Slideshow player side */}
              <div className="h-full flex flex-col">
                {listing.images && (
                  <div className="relative bg-black rounded-lg overflow-hidden h-full">
                    <SlideshowPlayer
                      images={listing.images}
                      musicUrl={musicUrl}
                    />
                  </div>
                )}
              </div>
              
              {/* Text editor side */}
              <div className="h-full flex flex-col border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Message de la publication</h3>
                <ScrollArea className="flex-grow">
                  <div className="pr-4 pb-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : (
                      <Textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="min-h-[200px] resize-none w-full"
                        placeholder="Entrez votre texte ici..."
                      />
                    )}
                    {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="facebook" className="h-[calc(85vh-12rem)] overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Aperçu Facebook</h3>
                <div className="p-2">
                  <FacebookPreview />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Diaporama</h3>
                {listing.images && (
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    <SlideshowPlayer
                      images={listing.images}
                      musicUrl={musicUrl}
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="instagram" className="h-[calc(85vh-12rem)] overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Aperçu Instagram</h3>
                <div className="p-2">
                  <InstagramPreview />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Diaporama</h3>
                {listing.images && (
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    <SlideshowPlayer
                      images={listing.images}
                      musicUrl={musicUrl}
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t mt-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Annuler
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => onPublish(editedText)} 
              disabled={isPublishing || isPublishingToInstagram}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Facebook className="w-4 h-4" />}
              {isPublishing ? "Publication en cours..." : "Publier sur Facebook"}
            </Button>
            <Button 
              onClick={handleInstagramPublish} 
              disabled={isPublishing || isPublishingToInstagram}
              variant="secondary"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              {isPublishingToInstagram ? <Loader2 className="w-4 h-4 animate-spin" /> : <Instagram className="w-4 h-4" />}
              {isPublishingToInstagram ? "Publication en cours..." : "Publier sur Instagram"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
