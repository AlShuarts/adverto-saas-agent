
export const validateConfig = (config: any) => {
  if (!config) {
    throw new Error("❌ Configuration manquante.");
  }

  if (!config.selectedImages || config.selectedImages.length === 0) {
    throw new Error("❌ Au moins une image est requise pour créer un diaporama.");
  }
  
  // Log the incoming configuration for debugging
  console.log("Configuration reçue avant traitement:", JSON.stringify(config, null, 2));
  console.log("Musique sélectionnée:", config.selectedMusic || "aucune");
  
  // Create a new config object with the processed musicUrl
  const processedConfig = {
    ...config,
    // Ne pas ajouter musicUrl s'il n'y a pas de selectedMusic
    musicUrl: config.selectedMusic ? 
      `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/background-music/${config.selectedMusic}` : 
      null
  };
  
  console.log("Configuration après traitement:", JSON.stringify(processedConfig, null, 2));
  
  return processedConfig;
};
