
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

type MusicSelectorProps = {
  musics: string[];
  selectedMusic: string | null | undefined;
  currentlyPlaying: string | null;
  onMusicChange: (value: string) => void;
  onPreviewMusic: (music: string) => void;
};

export const MusicSelector = ({ 
  musics, 
  selectedMusic, 
  currentlyPlaying,
  onMusicChange, 
  onPreviewMusic 
}: MusicSelectorProps) => {
  console.log("MusicSelector rendering with:", {
    selectedMusic,
    currentlyPlaying,
    musicCount: musics.length
  });

  return (
    <div className="space-y-2">
      <Label>Musique de fond</Label>
      <div className="flex items-center gap-2">
        <Select 
          value={selectedMusic || ""} 
          onValueChange={onMusicChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner une musique" />
          </SelectTrigger>
          <SelectContent>
            {musics.map((music) => (
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
            {currentlyPlaying === selectedMusic ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
