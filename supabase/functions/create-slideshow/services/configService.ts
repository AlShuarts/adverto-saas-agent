
export const validateConfig = (config: any) => {
  if (!config) {
    throw new Error("❌ Configuration manquante.");
  }

  if (!config.selectedImages || config.selectedImages.length === 0) {
    throw new Error("❌ Au moins une image est requise pour créer un diaporama.");
  }
  
  // Log de débogage amélioré
  console.log("Configuration reçue avant traitement:", JSON.stringify(config, null, 2));
  console.log("Musique sélectionnée dans la config:", config.selectedMusic || "aucune");
  
  // Traitement de l'URL de la musique
  let musicUrl = null;
  
  // S'assurer que selectedMusic est une chaîne non vide avant de construire l'URL
  if (config.selectedMusic && typeof config.selectedMusic === 'string' && config.selectedMusic.trim() !== '') {
    musicUrl = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/background-music/${config.selectedMusic}`;
    console.log("URL de musique construite:", musicUrl);
  } else {
    console.log("Aucune musique sélectionnée, musicUrl sera null");
  }
  
  // Création d'une copie propre de la configuration avec l'URL de musique correcte
  const processedConfig = {
    ...config,
    musicUrl: musicUrl
  };
  
  console.log("Configuration après traitement:", JSON.stringify(processedConfig, null, 2));
  
  return processedConfig;
};
