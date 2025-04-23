
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type SlideshowMusicSelectorProps = {
  musicList: string[];
  selectedMusic?: string;
  currentlyPlaying: string | null;
  onMusicChange: (value: string) => void;
  onPreviewMusic: (musicName: string) => void;
};

export const SlideshowMusicSelector = ({
  musicList,
  selectedMusic,
  currentlyPlaying,
  onMusicChange,
  onPreviewMusic
}: SlideshowMusicSelectorProps) => {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <Label htmlFor="selectedMusic">Musique de fond</Label>
        <div className="flex items-center gap-2">
          <Select value={selectedMusic} onValueChange={onMusicChange}>
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
              onClick={() => onPreviewMusic(selectedMusic)}
            >
              {currentlyPlaying === selectedMusic ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
