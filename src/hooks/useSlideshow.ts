import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";

type UseSlideshowProps = {
  listing?: Tables<"listings">;
  images?: string[];
  musicUrl?: string | null;
};

export const useSlideshow = ({ listing, images }: UseSlideshowProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);

  return {
    isLoading,
    videoUrl,
    setVideoUrl,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    currentIndex,
    setCurrentIndex,
  };
};