
/**
 * Génère des variables pour un template Shotstack
 * Les variables seront fusionnées avec le template pour créer le diaporama final
 */
export const generateTemplateVariables = (selectedImages: string[], textElements: string[], config: any) => {
  console.log(`📸 Génération de variables pour ${selectedImages.length} images avec ${textElements.length} éléments de texte`);
  
  // Variables pour le merge
  const mergeVariables = [];
  let totalDuration = 0;
  const slideDuration = config.imageDuration || 3;
  
  // Vérifications de base
  if (!selectedImages || selectedImages.length === 0) {
    console.error("❌ Aucune image sélectionnée pour le diaporama");
    throw new Error("Au moins une image est requise pour créer un diaporama");
  }

  // Mapper chaque image à une variable de merge
  // Nous utilisons un format différent car le template s'attend à des variables spécifiques
  selectedImages.forEach((imageUrl, index) => {
    // L'index commence à 1 pour correspondre à la convention du template
    const slideNumber = index + 1;
    
    // Ajouter l'URL de l'image
    mergeVariables.push({
      find: `IMAGE_SRC_${slideNumber}`,
      replace: imageUrl
    });
    
    // Ajouter le texte associé si disponible
    const slideText = textElements[index] || "";
    mergeVariables.push({
      find: `TEXT_VAR_${slideNumber}`,
      replace: slideText
    });
    
    totalDuration += slideDuration;
  });
  
  // Maintenant nous devons compléter toutes les variables attendues par le template
  // même si nous n'avons pas assez d'images
  // Le template peut attendre un nombre fixe de slides (ex: 10)
  const MAX_SLIDES = 10; // Nombre maximum de slides attendu par le template
  
  // Si on a moins d'images que le maximum attendu, ajouter des variables vides
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

  // Ajouter une variable pour l'audio
  if (config.musicUrl) {
    console.log(`🎵 Ajout de la musique: ${config.musicUrl}`);
    mergeVariables.push({
      find: "AUDIO_SRC",
      replace: config.musicUrl
    });
    
    // Ajouter la durée totale pour la musique
    mergeVariables.push({
      find: "AUDIO_DURATION",
      replace: totalDuration.toString()
    });
  } 
  // Fallback pour l'ancien format
  else if (config.selectedMusic) {
    console.log(`🎵 Utilisation du format legacy pour la musique: ${config.selectedMusic}`);
    const audioUrl = `https://msmuyhmxlrkcjthugcxd.supabase.co/storage/v1/object/public/background-music/${config.selectedMusic}`;
    mergeVariables.push({
      find: "AUDIO_SRC",
      replace: audioUrl
    });
    
    // Ajouter la durée totale pour la musique
    mergeVariables.push({
      find: "AUDIO_DURATION",
      replace: totalDuration.toString()
    });
  } else {
    console.log("🔇 Aucune musique sélectionnée pour le diaporama");
    // Ajouter quand même une variable audio vide (ou URL par défaut) pour éviter des erreurs
    mergeVariables.push({
      find: "AUDIO_SRC",
      replace: "" // ou une URL vers un fichier audio silencieux
    });
    
    mergeVariables.push({
      find: "AUDIO_DURATION",
      replace: totalDuration.toString()
    });
  }

  console.log(`✅ Variables générées pour ${selectedImages.length} images avec une durée totale de ${totalDuration} secondes`);
  console.log(`✅ Total de variables générées: ${mergeVariables.length}`);
  console.log(`📝 Variables de fusion: ${JSON.stringify(mergeVariables, null, 2)}`);

  return { mergeVariables, totalDuration };
};

// Conserver la fonction originale pour la rétrocompatibilité
export const generateSlideShowClips = (selectedImages: string[], textElements: string[], config: any) => {
  const clips = [];
  let totalDuration = 0;
  const effects = ["slideLeftSlow", "slideRightSlow"];

  console.log(`📸 Génération de clips pour ${selectedImages.length} images avec ${textElements.length} éléments de texte`);

  // Ajouter toutes les images
  for (let i = 0; i < selectedImages.length; i++) {
    const imageUrl = selectedImages[i];
    const effect = effects[i % effects.length];
    const slideDuration = config.imageDuration || 3;

    const imageClip = {
      asset: { type: 'image', src: imageUrl },
      start: totalDuration,
      length: slideDuration,
      effect: effect,
      fit: "cover",
      scale: 1.0,
      position: "center",
      opacity: 1.0
    };
    clips.push(imageClip);

    // Ajouter le texte correspondant sous l'image
    if (textElements[i]) {
      console.log(`📝 Ajout du texte pour l'image ${i}: ${textElements[i]}`);
      const textHeight = i === 0 ? 150 : 50;
      const textClip = {
        asset: {
          type: "text",
          text: textElements[i],
          width: 500,
          height: textHeight,
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
        start: totalDuration,
        length: slideDuration,
        offset: { x: 0, y: -0.4 }
      };
      clips.push(textClip);
    }

    totalDuration += slideDuration;
  }

  // Ajouter un clip audio si une musique est sélectionnée
  if (config.musicUrl) {
    console.log(`🎵 Ajout de la musique: ${config.musicUrl}`);
    const audioClip = {
      asset: { type: 'audio', src: config.musicUrl },
      start: 0,
      length: totalDuration
    };
    clips.push(audioClip);
    console.log(`🎵 Clip audio ajouté: ${config.musicUrl}, durée: ${totalDuration}s`);
  }
  // Fallback pour l'ancien format
  else if (config.selectedMusic) {
    console.log(`🎵 Utilisation du format legacy pour la musique: ${config.selectedMusic}`);
    const audioUrl = `https://msmuyhmxlrkcjthugcxd.supabase.co/storage/v1/object/public/background-music/${config.selectedMusic}`;
    const audioClip = {
      asset: { type: 'audio', src: audioUrl },
      start: 0,
      length: totalDuration
    };
    clips.push(audioClip);
    console.log(`🎵 Clip audio ajouté (format legacy): ${audioUrl}, durée: ${totalDuration}s`);
  } else {
    console.log("🔇 Aucune musique sélectionnée pour le diaporama");
  }

  console.log(`✅ Total clips générés: ${clips.length} avec une durée totale de ${totalDuration} secondes`);

  return { clips, totalDuration };
};
