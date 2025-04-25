
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

  // Add audio variables
  mergeVariables.push(...generateAudioVariables(config, totalDuration));

  console.log(`✅ Variables générées pour ${selectedImages.length} images avec une durée totale de ${totalDuration} secondes`);
  console.log(`✅ Total de variables générées: ${mergeVariables.length}`);
  console.log(`📝 Variables de fusion: ${JSON.stringify(mergeVariables, null, 2)}`);

  return { mergeVariables, totalDuration };
};

const generateAudioVariables = (config: SlideshowConfig, totalDuration: number): MergeVariable[] => {
  const variables: MergeVariable[] = [];
  
  if (config.musicUrl) {
    console.log(`🎵 Ajout de la musique (URL directe): ${config.musicUrl}`);
    variables.push({ find: "AUDIO_SRC", replace: config.musicUrl });
  } 
  else if (config.selectedMusic) {
    console.log(`🎵 Utilisation du format legacy pour la musique: ${config.selectedMusic}`);
    const audioUrl = `https://msmuyhmxlrkcjthugcxd.supabase.co/storage/v1/object/public/background-music/${config.selectedMusic}`;
    console.log(`🎵 URL complète générée pour la musique: ${audioUrl}`);
    variables.push({ find: "AUDIO_SRC", replace: audioUrl });
  } 
  else {
    console.log("🔇 Aucune musique sélectionnée pour le diaporama");
    variables.push({ find: "AUDIO_SRC", replace: "" });
  }
  
  variables.push({ find: "AUDIO_DURATION", replace: totalDuration.toString() });
  
  return variables;
};
