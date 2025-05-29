
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FacebookPreviewContent } from "@/components/FacebookPreviewContent";
import { InstagramPreviewContent } from "@/components/InstagramPreviewContent";
import { Facebook, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type PublicationType = "photo" | "slideshow" | "banner";

type PublicationPreviewProps = {
  selectedNetworks: {
    facebook: boolean;
    instagram: boolean;
  };
  generatedText: string;
  setGeneratedText: (text: string) => void;
  images: string[];
  selectedImages: string[];
  setSelectedImages: (images: string[]) => void;
  slideshowUrl: string | null;
  bannerUrl: string | null;
  selectedMusic: string | undefined;
  selectedPublicationTypes: PublicationType[];
  listing: Tables<"listings">;
};

export const PublicationPreview = ({
  selectedNetworks,
  generatedText,
  setGeneratedText,
  images,
  selectedImages,
  setSelectedImages,
  slideshowUrl,
  bannerUrl,
  selectedMusic,
  selectedPublicationTypes,
  listing
}: PublicationPreviewProps) => {
  const musicUrl = selectedMusic
    ? `${supabase.storage.from('background-music').getPublicUrl(selectedMusic).data.publicUrl}`
    : null;

  return (
    <Tabs defaultValue="facebook" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="facebook" disabled={!selectedNetworks.facebook}>
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </TabsTrigger>
        <TabsTrigger value="instagram" disabled={!selectedNetworks.instagram}>
          <Instagram className="w-4 h-4 mr-2" />
          Instagram
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="facebook">
        {selectedNetworks.facebook ? (
          <div className="border rounded-md p-4">
            <FacebookPreviewContent 
              isLoading={false}
              error={null}
              generatedText={generatedText}
              images={images}
              onTextChange={setGeneratedText}
              selectedImages={
                selectedPublicationTypes.includes("banner") && bannerUrl 
                  ? [bannerUrl] 
                  : selectedImages
              }
              onSelectedImagesChange={setSelectedImages}
              slideshowUrl={slideshowUrl}
              musicUrl={musicUrl}
              showSlideshow={selectedPublicationTypes.includes("slideshow")}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
            <Facebook className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              Sélectionnez Facebook pour voir l'aperçu.
            </p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="instagram">
        {selectedNetworks.instagram ? (
          <div className="border rounded-md p-4">
            <InstagramPreviewContent 
              isLoading={false}
              error={null}
              generatedText={generatedText}
              images={images}
              onTextChange={setGeneratedText}
              selectedImages={
                selectedPublicationTypes.includes("banner") && bannerUrl
                  ? [bannerUrl]
                  : selectedImages
              }
              onSelectedImagesChange={setSelectedImages}
              slideshowUrl={slideshowUrl}
              musicUrl={musicUrl}
              showSlideshow={selectedPublicationTypes.includes("slideshow")}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
            <Instagram className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              Sélectionnez Instagram pour voir l'aperçu.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
