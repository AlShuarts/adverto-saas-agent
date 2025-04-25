
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

  // Add audio variables with proper validation and URL construction
  if (config.musicUrl) {
    console.log(`🎵 Ajout de la musique depuis l'URL déjà configurée: ${config.musicUrl}`);
    mergeVariables.push(
      { find: "AUDIO_SRC", replace: config.musicUrl },
      { find: "AUDIO_DURATION", replace: totalDuration.toString() }
    );
  } else if (config.selectedMusic && config.selectedMusic.trim() !== '') {
    // Construction explicite de l'URL à partir du nom de fichier sélectionné
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const musicUrl = `${supabaseUrl}/storage/v1/object/public/background-music/${config.selectedMusic}`;
    console.log(`🎵 Construction manuelle de l'URL audio: ${musicUrl}`);
    mergeVariables.push(
      { find: "AUDIO_SRC", replace: musicUrl },
      { find: "AUDIO_DURATION", replace: totalDuration.toString() }
    );
  } else {
    console.log("🔇 Aucune musique sélectionnée pour le diaporama");
    // Utiliser une valeur spéciale "none" qui sera validée plus tard
    mergeVariables.push(
      { find: "AUDIO_SRC", replace: "https://shotstack-assets.s3.amazonaws.com/empty-audio.mp3" },
      { find: "AUDIO_DURATION", replace: totalDuration.toString() }
    );
  }

  console.log(`✅ Variables générées pour ${selectedImages.length} images avec une durée totale de ${totalDuration} secondes`);
  console.log(`✅ Total de variables générées: ${mergeVariables.length}`);
  console.log(`📝 Variables de fusion: ${JSON.stringify(mergeVariables, null, 2)}`);

  return { mergeVariables, totalDuration };
};
