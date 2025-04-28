
// This service contains functions for validating and preparing slideshow configurations

export const validateConfig = (rawConfig: any) => {
  console.log("Configuration reçue avant traitement:", JSON.stringify(rawConfig, null, 2));
  
  // Check if music is selected
  console.log("Musique sélectionnée dans la config:", rawConfig.selectedMusic || "aucune");
  
  // If selectedMusic is provided, get the URL
  let musicUrl = undefined;
  if (rawConfig.selectedMusic) {
    console.log("Une musique est sélectionnée:", rawConfig.selectedMusic);
    
    // The musicUrl may already be provided in the config
    if (rawConfig.musicUrl) {
      musicUrl = rawConfig.musicUrl;
      console.log("URL de musique déjà fournie:", musicUrl);
    } else {
      console.log("Aucune URL de musique fournie, il faudra la générer");
    }
  } else {
    console.log("Aucune musique sélectionnée, musicUrl sera null");
  }
  
  // Create a validated config object with defaults
  const config = {
    imageDuration: rawConfig.imageDuration || 3,
    showDetails: rawConfig.showDetails !== false,
    showPrice: rawConfig.showPrice !== false,
    showAddress: rawConfig.showAddress !== false,
    selectedImages: rawConfig.selectedImages || [],
    selectedMusic: rawConfig.selectedMusic || null,
    musicUrl: musicUrl
  };
  
  console.log("Configuration après traitement:", JSON.stringify(config, null, 2));
  return config;
};
