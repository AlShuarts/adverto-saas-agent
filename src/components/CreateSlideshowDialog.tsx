import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Checkbox } from "@/components/ui/checkbox";
import { MoveVertical, Play, Pause } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SlideshowConfig = {
  showPrice: boolean;
  showDetails: boolean;
  showAddress: boolean;
  showBedrooms: boolean;
  showBathrooms: boolean;
  showPropertyType: boolean;
  transition: string;
  musicVolume: number;
  selectedImages: string[];
  selectedMusic?: string;
};

type CreateSlideshowDialogProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
};

export const CreateSlideshowDialog = ({
  listing,
  isOpen,
  onClose,
}: CreateSlideshowDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [musicList, setMusicList] = useState<string[]>([]);
  const [audioPlaying, setAudioPlaying] = useState<HTMLAudioElement | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  
  const [config, setConfig] = useState<SlideshowConfig>({
    showPrice: true,
    showDetails: true,
    showAddress: true,
    showBedrooms: true,
    showBathrooms: true,
    showPropertyType: true,
    transition: "fade",
    musicVolume: 0.5,
    selectedImages: listing.images || [],
    selectedMusic: undefined,
  });

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const { data, error } = await supabase
          .storage
          .from('background-music')
          .list();
        
        if (error) {
          console.error("Erreur lors de la récupération des musiques:", error);
          return;
        }
        
        if (data) {
          const musicFiles = data
            .filter(file => !file.name.startsWith('.')) // Filtrer les fichiers cachés
            .map(file => file.name);
          
          setMusicList(musicFiles);
          
          if (musicFiles.length > 0 && !config.selectedMusic) {
            setConfig(prev => ({ ...prev, selectedMusic: musicFiles[0] }));
          }
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    };
    
    fetchMusic();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      console.log("Configuration envoyée:", config);

      const response = await supabase.functions.invoke("create-slideshow", {
        body: {
          listingId: listing.id,
          config: {
            imageDuration: 3,
            showDetails: config.showDetails,
            showPrice: config.showPrice,
            showAddress: config.showAddress,
            selectedImages: config.selectedImages,
            selectedMusic: config.selectedMusic,
          },
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Création du diaporama initiée",
        description: "Vous serez notifié lorsque le diaporama sera prêt.",
      });
      onClose();
    } catch (error) {
      console.error("Error creating slideshow:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du diaporama.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(config.selectedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setConfig({ ...config, selectedImages: items });
  };

  const toggleImageSelection = (imageUrl: string) => {
    if (config.selectedImages.includes(imageUrl)) {
      setConfig({
        ...config,
        selectedImages: config.selectedImages.filter((url) => url !== imageUrl),
      });
    } else {
      setConfig({
        ...config,
        selectedImages: [...config.selectedImages, imageUrl],
      });
    }
  };

  const handleMusicChange = (value: string) => {
    stopAudio();
    setConfig({ ...config, selectedMusic: value });
  };

  const previewMusic = (musicName: string) => {
    if (currentlyPlaying === musicName) {
      stopAudio();
      return;
    }
    
    stopAudio();
    
    const audio = new Audio();
    audio.src = `${supabase.storage.from('background-music').getPublicUrl(musicName).data.publicUrl}`;
    audio.volume = config.musicVolume;
    audio.play();
    
    setAudioPlaying(audio);
    setCurrentlyPlaying(musicName);
  };

  const stopAudio = () => {
    if (audioPlaying) {
      audioPlaying.pause();
      audioPlaying.currentTime = 0;
      setAudioPlaying(null);
      setCurrentlyPlaying(null);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopAudio();
    }
    
    return () => {
      stopAudio();
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un diaporama</DialogTitle>
          <DialogDescription>
            Configurez les paramètres de votre diaporama vidéo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <Label>Sélection et ordre des images</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Images disponibles</h4>
                <div className="grid grid-cols-2 gap-2 border rounded-lg p-2">
                  {listing.images?.map((imageUrl) => (
                    <div key={imageUrl} className="relative group">
                      <img
                        src={imageUrl}
                        alt="Property"
                        className="w-full h-24 object-cover rounded"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Checkbox
                          checked={config.selectedImages.includes(imageUrl)}
                          onCheckedChange={() => toggleImageSelection(imageUrl)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Images sélectionnées</h4>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="selected-images">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="border rounded-lg p-2 min-h-[200px]"
                      >
                        {config.selectedImages.map((imageUrl, index) => (
                          <Draggable
                            key={imageUrl}
                            draggableId={imageUrl}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex items-center gap-2 mb-2 p-2 bg-secondary rounded"
                              >
                                <MoveVertical className="w-4 h-4" />
                                <img
                                  src={imageUrl}
                                  alt="Selected"
                                  className="w-16 h-12 object-cover rounded"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleImageSelection(imageUrl)}
                                >
                                  Retirer
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="font-medium">Informations à afficher</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showAddress">Afficher l'adresse</Label>
              <Switch
                id="showAddress"
                checked={config.showAddress}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, showAddress: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showPrice">Afficher le prix</Label>
              <Switch
                id="showPrice"
                checked={config.showPrice}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, showPrice: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showDetails">Afficher les détails (chambres/SDB)</Label>
              <Switch
                id="showDetails"
                checked={config.showDetails}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, showDetails: checked })
                }
              />
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="font-medium">Musique de fond</h3>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="selectedMusic">Sélectionner une musique</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={config.selectedMusic}
                  onValueChange={handleMusicChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner une musique" />
                  </SelectTrigger>
                  <SelectContent>
                    {musicList.map((music) => (
                      <SelectItem key={music} value={music}>
                        {music.replace(/\.[^/.]+$/, "")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {config.selectedMusic && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => previewMusic(config.selectedMusic!)}
                  >
                    {currentlyPlaying === config.selectedMusic ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="musicVolume">Volume de la musique (prévisualisation uniquement)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="musicVolume"
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={config.musicVolume}
                  onChange={(e) => {
                    const newVolume = Number(e.target.value);
                    setConfig({ ...config, musicVolume: newVolume });
                    if (audioPlaying) {
                      audioPlaying.volume = newVolume;
                    }
                  }}
                  className="flex-1"
                />
                <span className="text-sm w-10 text-right">
                  {Math.round(config.musicVolume * 100)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Note: Ce réglage affecte uniquement la prévisualisation. Le volume dans le diaporama final sera défini automatiquement.</p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Création en cours..." : "Créer le diaporama"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
