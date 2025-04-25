
/**
 * Handles the generation of clips for Shotstack
 */

import { SlideshowConfig } from "../types/config.ts";

interface Clip {
  asset: any;
  start: number;
  length: number;
  effect?: string;
  fit?: string;
  scale?: number;
  position?: string;
  opacity?: number;
  offset?: { x: number; y: number };
}

export const generateSlideShowClips = (selectedImages: string[], textElements: string[], config: SlideshowConfig) => {
  const clips: Clip[] = [];
  let totalDuration = 0;
  const effects = ["slideLeftSlow", "slideRightSlow"];
  const slideDuration = config.imageDuration || 3;

  console.log(`📸 Génération de clips pour ${selectedImages.length} images avec ${textElements.length} éléments de texte`);

  // Add image and text clips
  selectedImages.forEach((imageUrl, i) => {
    clips.push(
      ...generateImageAndTextClips(
        imageUrl, 
        textElements[i], 
        totalDuration, 
        slideDuration, 
        effects[i % effects.length],
        i === 0
      )
    );
    totalDuration += slideDuration;
  });

  // Add audio clip if music is selected
  const audioClip = generateAudioClip(config, totalDuration);
  if (audioClip) {
    clips.push(audioClip);
  }

  console.log(`✅ Total clips générés: ${clips.length} avec une durée totale de ${totalDuration} secondes`);

  return { clips, totalDuration };
};

const generateImageAndTextClips = (
  imageUrl: string, 
  text: string, 
  start: number, 
  duration: number, 
  effect: string,
  isFirstSlide: boolean
): Clip[] => {
  const clips: Clip[] = [{
    asset: { type: 'image', src: imageUrl },
    start,
    length: duration,
    effect,
    fit: "cover",
    scale: 1.0,
    position: "center",
    opacity: 1.0
  }];

  if (text) {
    console.log(`📝 Ajout du texte pour l'image: ${text}`);
    clips.push({
      asset: {
        type: "text",
        text,
        width: 500,
        height: isFirstSlide ? 150 : 50,
        font: {
          family: "Poppins",
          color: "#ffffff",
          opacity: 1.0,
          size: 30,
          weight: 500,
          lineHeight: 1.5
        },
        background: {
          color: "#000000",
          opacity: 0.3
        },
        alignment: {
          horizontal: "center",
          vertical: "center"
        }
      },
      start,
      length: duration,
      offset: { x: 0, y: -0.4 }
    });
  }

  return clips;
};

const generateAudioClip = (config: SlideshowConfig, totalDuration: number): Clip | null => {
  // Gestion explicite du cas où une musique est sélectionnée via URL
  if (config.musicUrl && config.musicUrl.trim() !== '') {
    console.log(`🎵 Ajout de la musique depuis l'URL directe: ${config.musicUrl}`);
    return {
      asset: { type: 'audio', src: config.musicUrl },
      start: 0,
      length: totalDuration
    };
  }
  
  // Gestion explicite du cas où une musique est sélectionnée via nom de fichier
  if (config.selectedMusic && config.selectedMusic.trim() !== '') {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const audioUrl = `${supabaseUrl}/storage/v1/object/public/background-music/${config.selectedMusic}`;
    console.log(`🎵 Ajout de la musique (nom de fichier): ${config.selectedMusic}`);
    console.log(`🎵 URL complète générée: ${audioUrl}`);
    return {
      asset: { type: 'audio', src: audioUrl },
      start: 0,
      length: totalDuration
    };
  }
  
  console.log("🔇 Aucune musique sélectionnée, utilisation d'un fichier audio vide");
  return {
    asset: { type: 'audio', src: "https://shotstack-assets.s3.amazonaws.com/empty-audio.mp3" },
    start: 0,
    length: totalDuration
  };
};
