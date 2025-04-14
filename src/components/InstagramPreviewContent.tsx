
import { Tables } from "@/integrations/supabase/types";
import { Loader2, Instagram } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SlideshowPlayer } from "./slideshow/SlideshowPlayer";

type InstagramPreviewContentProps = {
  isLoading: boolean;
  error: string | null;
  generatedText: string;
  images: string[];
  onTextChange: (text: string) => void;
  selectedImages: string[];
  onSelectedImagesChange: (images: string[]) => void;
  slideshowUrl?: string | null;
  musicUrl?: string | null;
  showSlideshow?: boolean;
};

export const InstagramPreviewContent = ({
  isLoading,
  error,
  generatedText,
  images,
  onTextChange,
  selectedImages,
  onSelectedImagesChange,
  slideshowUrl,
  musicUrl,
  showSlideshow = false,
}: InstagramPreviewContentProps) => {
  const handleImageSelect = (image: string) => {
    const isSelected = selectedImages.includes(image);
    
    if (isSelected) {
      const newSelection = selectedImages.filter((i) => i !== image);
      onSelectedImagesChange(newSelection);
    } else if (selectedImages.length < 10) {
      const newSelection = [...selectedImages, image];
      onSelectedImagesChange(newSelection);
    }
  };

  const renderMediaContent = () => {
    if (showSlideshow && slideshowUrl) {
      return (
        <div className="aspect-square bg-black rounded-lg overflow-hidden mb-3">
          <video 
            src={slideshowUrl} 
            className="w-full h-full object-cover"
            controls
            autoPlay
            muted
            loop
          />
        </div>
      );
    } else if (selectedImages.length > 0) {
      return (
        <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3">
          <img
            src={selectedImages[0]}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass border border-border/40 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-700 rounded-full flex items-center justify-center">
          <Instagram className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Votre Compte Instagram</p>
          <p className="text-sm text-muted-foreground">Maintenant</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex flex-col space-y-4">
            <div className="p-4 rounded-lg bg-card border">
              {renderMediaContent()}
              
              <div className="flex space-x-4 py-2 border-b pb-2">
                <div className="flex space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
              </div>

              <div className="py-2">
                <p className="font-semibold text-sm">0 J'aime</p>
                <div className="mt-1">
                  <span className="font-semibold text-sm">Votre Compte</span>{" "}
                  <span className="text-sm whitespace-pre-wrap">{generatedText}</span>
                </div>
              </div>
            </div>

            {!showSlideshow && images.length > 0 && (
              <>
                <div className="bg-secondary/10 rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez jusqu'à 10 images en cochant les cases. Les images sélectionnées seront publiées dans l'ordre de sélection.
                  </p>
                </div>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group border-2 border-transparent hover:border-pink-500 transition-all duration-200 rounded-lg">
                        <img
                          src={image}
                          alt={`Image ${index + 1}`}
                          className="w-full aspect-square object-cover rounded"
                        />
                        <div className="absolute top-2 left-2 bg-black/50 p-1.5 rounded">
                          <Checkbox
                            checked={selectedImages.includes(image)}
                            onCheckedChange={() => handleImageSelect(image)}
                            disabled={!selectedImages.includes(image) && selectedImages.length >= 10}
                            className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                          />
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs">
                          {index + 1}/{images.length}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedImages.length}/10 images sélectionnées
                </p>
              </>
            )}
            
            <Textarea
              value={generatedText}
              onChange={(e) => onTextChange(e.target.value)}
              className="min-h-[150px]"
              placeholder="Entrez votre texte ici..."
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        </>
      )}
    </div>
  );
};
