
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BackgroundMusic } from "./backgroundMusic";
import { useState, useEffect } from "react";

type MusicSelectorProps = {
  musics: BackgroundMusic[] | string[];
  selectedMusic: string | null;
  onMusicChange: (value: string) => void;
};

export const MusicSelector = ({ musics, selectedMusic, onMusicChange }: MusicSelectorProps) => {
  // Debug logs
  useEffect(() => {
    console.log("MusicSelector - Props received:", { 
      musicsCount: musics.length,
      selectedMusic,
    });
  }, [musics, selectedMusic]);
  
  return (
    <div className="space-y-2">
      <Label>Musique de fond</Label>
      <RadioGroup
        value={selectedMusic || undefined}
        onValueChange={onMusicChange}
        className="space-y-2"
      >
        {musics.map((music) => {
          const id = typeof music === 'string' ? music : music.id;
          const name = typeof music === 'string' ? music.replace(/\.[^/.]+$/, "") : music.name;
          const value = typeof music === 'string' ? music : music.url;
          
          return (
            <div key={id} className="flex items-center space-x-2">
              <RadioGroupItem value={value} id={id} />
              <Label htmlFor={id}>{name}</Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};
