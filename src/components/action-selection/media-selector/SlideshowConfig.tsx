
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, Pause, Music } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ImageSelection } from "../media-generation/components/ImageSelection";

type SlideshowConfigProps = {
  images: string[];
  selectedImages: string[];
  musicList: string[];
  selectedMusic?: string;
  currentlyPlaying: string | null;
  toggleImageSelection: (imageUrl: string) => void;
  onDragEnd: (result: any) => void;
  handleMusicChange: (value: string) => void;
  previewMusic: (musicName: string) => void;
};

export const SlideshowConfig = ({
  images,
  selectedImages,
  musicList,
  selectedMusic,
  currentlyPlaying,
  toggleImageSelection,
  handleMusicChange,
  previewMusic
}: SlideshowConfigProps) => {
  const isMobile = useIsMobile();

  const selectAllImages = () => {
    images.forEach(image => {
      if (!selectedImages.includes(image)) {
        toggleImageSelection(image);
      }
    });
  };

  const deselectAllImages = () => {
    selectedImages.forEach(image => {
      toggleImageSelection(image);
    });
  };

  return (
    <div className="space-y-4 border rounded-md p-3 md:p-4">
      <h4 className="font-medium">Configuration du diaporama</h4>
      
      {/* Image Selection */}
      <div className="space-y-2">
        <ImageSelection 
          selectedImages={selectedImages} 
          toggleImageSelection={toggleImageSelection} 
          availableImages={images}
          onSelectAll={selectAllImages}
          onDeselectAll={deselectAllImages}
        />
      </div>
      
      {/* Music Selection */}
      <div className="space-y-2">
        <Label>Musique de fond</Label>
        <div className="flex items-center gap-2 flex-wrap">
          <Select 
            value={selectedMusic || ""} 
            onValueChange={handleMusicChange}
          >
            <SelectTrigger className="w-full max-w-[calc(100%-60px)]">
              <SelectValue placeholder="Sélectionner une musique" />
            </SelectTrigger>
            <SelectContent>
              {musicList.map(music => (
                <SelectItem key={music} value={music}>
                  {music.replace(/\.[^/.]+$/, "")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedMusic && (
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={() => previewMusic(selectedMusic)}
              className="flex-shrink-0"
              aria-label={currentlyPlaying === selectedMusic ? "Arrêter la musique" : "Écouter la musique"}
              title={currentlyPlaying === selectedMusic ? "Arrêter la musique" : "Écouter la musique"}
            >
              {currentlyPlaying === selectedMusic ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
        {selectedMusic ? (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Music className="h-3 w-3" /> 
            Musique sélectionnée: {selectedMusic.replace(/\.[^/.]+$/, "")}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">
            Aucune musique sélectionnée
          </p>
        )}
      </div>
    </div>
  );
};
