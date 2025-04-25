
/**
 * Handles the generation of template variables for Shotstack
 */

import { SlideshowConfig } from "../types/config.ts";

const MAX_SLIDES = 10;

interface MergeVariable {
  find: string;
  replace: string;
}

export const generateTemplateVariables = (selectedImages: string[], textElements: string[], config: SlideshowConfig) => {
  console.log(`📸 Génération de variables pour ${selectedImages.length} images avec ${textElements.length} éléments de texte`);
  console.log(`🎵 Configuration audio reçue:`, JSON.stringify({
    musicUrl: config.musicUrl,
    selectedMusic: config.selectedMusic
  }, null, 2));
  
  const mergeVariables: MergeVariable[] = [];
  let totalDuration = 0;
  const slideDuration = config.imageDuration || 3;
  
  if (!selectedImages || selectedImages.length === 0) {
    console.error("❌ Aucune image sélectionnée pour le diaporama");
    throw new Error("Au moins une image est requise pour créer un diaporama");
  }

  // Map each image to merge variables
  selectedImages.forEach((imageUrl, index) => {
    const slideNumber = index + 1;
    
    mergeVariables.push({
      find: `IMAGE_SRC_${slideNumber}`,
      replace: imageUrl
    });
    
    mergeVariables.push({
      find: `TEXT_VAR_${slideNumber}`,
      replace: textElements[index] || ""
    });
    
    totalDuration += slideDuration;
  });
  
  // Fill remaining template slots with placeholder values
  for (let i = selectedImages.length + 1; i <= MAX_SLIDES; i++) {
    mergeVariables.push({
      find: `IMAGE_SRC_${i}`,
      replace: "https://placehold.co/1920x1080/black/white?text=No+Image"
    });
    
    mergeVariables.push({
      find: `TEXT_VAR_${i}`,
      replace: ""
    });
  }

  // Add audio variables with proper validation
  console.log("🎵 Traitement de la configuration audio:", {
    musicUrl: config.musicUrl,
    selectedMusic: config.selectedMusic
  });

  let audioSrc = "https://shotstack-assets.s3.amazonaws.com/empty-audio.mp3"; // Default empty audio

  if (config.musicUrl && config.selectedMusic) {
    console.log(`🎵 Utilisation de la musique: ${config.selectedMusic} depuis ${config.musicUrl}`);
    audioSrc = config.musicUrl;
  } else {
    console.log("🔇 Utilisation de l'audio vide par défaut");
  }

  mergeVariables.push(
    { find: "AUDIO_SRC", replace: audioSrc },
    { find: "AUDIO_DURATION", replace: totalDuration.toString() }
  );

  console.log(`✅ Variables générées pour ${selectedImages.length} images avec une durée totale de ${totalDuration} secondes`);
  console.log(`✅ Total de variables générées: ${mergeVariables.length}`);
  console.log(`📝 Variables de fusion complètes:`, JSON.stringify(mergeVariables, null, 2));

  return { mergeVariables, totalDuration };
};
