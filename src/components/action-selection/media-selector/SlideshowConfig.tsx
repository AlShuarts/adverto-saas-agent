
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MoveVertical, Play, Pause } from "lucide-react";

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
  onDragEnd,
  handleMusicChange,
  previewMusic
}: SlideshowConfigProps) => {
  return (
    <div className="space-y-4 border rounded-md p-4">
      <h4 className="font-medium">Configuration du diaporama</h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Sélection des photos pour le diaporama</Label>
          <ScrollArea className="h-[220px] border rounded-lg p-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
              {images?.map(imageUrl => (
                <div key={imageUrl} className="relative group">
                  <img src={imageUrl} alt="Property" className="w-full h-24 object-cover rounded" />
                  <div className={`absolute inset-0 flex items-center justify-center bg-black/50 ${selectedImages.includes(imageUrl) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    <Checkbox 
                      checked={selectedImages.includes(imageUrl)} 
                      onCheckedChange={() => toggleImageSelection(imageUrl)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <div className="space-y-2">
          <Label>Ordre des photos</Label>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="selected-images">
              {provided => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef} 
                  className="border rounded-lg p-2 h-[220px] overflow-y-auto"
                >
                  {selectedImages.length > 0 ? (
                    selectedImages.map((imageUrl, index) => (
                      <Draggable key={imageUrl} draggableId={imageUrl} index={index}>
                        {provided => (
                          <div 
                            ref={provided.innerRef} 
                            {...provided.draggableProps} 
                            {...provided.dragHandleProps} 
                            className="flex items-center gap-2 mb-2 p-2 bg-secondary rounded"
                          >
                            <MoveVertical className="w-4 h-4" />
                            <img src={imageUrl} alt="Selected" className="w-16 h-12 object-cover rounded" />
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
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Aucune image sélectionnée
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Musique de fond</Label>
        <div className="flex items-center gap-2">
          <Select 
            value={selectedMusic} 
            onValueChange={handleMusicChange}
          >
            <SelectTrigger className="w-full">
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
            >
              {currentlyPlaying === selectedMusic ? 
                <Pause className="h-4 w-4" /> : 
                <Play className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
