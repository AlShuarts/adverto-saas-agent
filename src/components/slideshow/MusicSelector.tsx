import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BackgroundMusic } from "./backgroundMusic";

type MusicSelectorProps = {
  musics: BackgroundMusic[];
  selectedMusic: string | null;
  onMusicChange: (value: string) => void;
};

export const MusicSelector = ({ musics, selectedMusic, onMusicChange }: MusicSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Musique de fond</Label>
      <RadioGroup
        value={selectedMusic || undefined}
        onValueChange={onMusicChange}
        className="space-y-2"
      >
        {musics.map((music) => (
          <div key={music.id} className="flex items-center space-x-2">
            <RadioGroupItem value={music.url} id={music.id} />
            <Label htmlFor={music.id}>{music.name}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};