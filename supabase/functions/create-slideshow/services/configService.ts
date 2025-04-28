
import { SlideshowConfig } from "../types/config.ts";
import { supabase } from "./databaseService.ts";

export const validateConfig = (rawConfig: any): SlideshowConfig => {
  // Vérification et normalisation de la configuration
  const config: SlideshowConfig = {
    imageDuration: rawConfig.imageDuration || 3,
    showDetails: rawConfig.showDetails !== false,
    showPrice: rawConfig.showPrice !== false,
    showAddress: rawConfig.showAddress !== false,
    selectedImages: Array.isArray(rawConfig.selectedImages) ? rawConfig.selectedImages : [],
    selectedMusic: rawConfig.selectedMusic || undefined,
    musicUrl: undefined // Will be populated below if selectedMusic exists
  };

  console.log("Config reçue:", JSON.stringify(rawConfig, null, 2));
  console.log("🎵 Configuration de la musique:", rawConfig.selectedMusic);

  // Traitement de la musique
  if (config.selectedMusic) {
    console.log("🎵 Musique sélectionnée:", config.selectedMusic);
    config.musicUrl = supabase.storage.from('background-music')
      .getPublicUrl(config.selectedMusic).data.publicUrl;
    console.log("🎵 URL de la musique générée:", config.musicUrl);
  } else {
    console.log("🔇 Aucune musique sélectionnée");
  }

  if (config.selectedImages.length === 0) {
    throw new Error("Au moins une image est nécessaire pour créer un diaporama");
  }

  return config;
};
