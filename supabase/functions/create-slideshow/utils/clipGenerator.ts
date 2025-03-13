
export const generateSlideShowClips = (selectedImages: string[], textElements: string[], config: any) => {
  const clips = [];
  let totalDuration = 0;
  const effects = ["slideLeftSlow", "slideRightSlow"];

  console.log(`Génération de clips pour ${selectedImages.length} images avec ${textElements.length} éléments de texte`);
  console.log(`Configuration showDetails: ${config.showDetails}, showPrice: ${config.showPrice}, showAddress: ${config.showAddress}`);
  console.log(`Musique sélectionnée: ${config.selectedMusic || 'aucune'}`);

  // Add all image clips first with respective durations
  for (let i = 0; i < selectedImages.length; i++) {
    const imageUrl = selectedImages[i];
    const effect = effects[i % effects.length];
    
    // Add the image clip
    const imageClip = {
      asset: {
        type: 'image',
        src: imageUrl,
      },
      start: totalDuration,
      length: config.imageDuration || 3,
      effect: effect,
      fit: "cover",
      scale: 1.0,
      position: "center",
      opacity: 1.0
    };
    clips.push(imageClip);

    totalDuration += config.imageDuration || 3;
  }

  // Reset totalDuration to add text clips that match image timing
  totalDuration = 0;

  // Then add text clips on top of images (with proper z-index)
  for (let i = 0; i < selectedImages.length; i++) {
    // Add text only if we have text elements left to show
    if (i < textElements.length) {
      const textToShow = textElements[i];
      
      console.log(`Ajout du texte pour l'image ${i}: ${textToShow}`);
      
      // Déterminer le type de texte basé sur l'index
      const isAddress = config.showAddress && i === 0;
      const isPrice = config.showPrice && i === 1;
      const isDetails = config.showDetails && i === 2;
      
      // Hauteur basée sur le type de texte
      const textHeight = isAddress ? 150 : 50;
      
      // Position verticale déterminée par le type de texte
      let verticalOffset = -0.4; // Position par défaut
      if (isPrice) {
        verticalOffset = -0.4; // Même position que l'adresse mais sur la deuxième diapo
      } else if (isDetails) {
        verticalOffset = -0.4; // Même position que les autres mais sur la troisième diapo
      }
      
      const textClip = {
        asset: {
          type: "text",
          text: textToShow,
          width: 500,
          height: textHeight,
          font: {
            family: "Poppins",
            color: "#ffffff",
            opacity: 1.0,
            size: 30,
            weight: 500,
            lineHeight: 1.5,
          },
          background: {
            color: "#000000",
            opacity: 0.3,
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
        },
        start: totalDuration,
        length: 3 //config.imageDuration || 3,
        offset: {
          x: 0,
          y: verticalOffset
        },
        //zIndex: 10, // Explicitly set zIndex to ensure text appears above images
      };
      clips.push(textClip);
    totalDuration += 3 //config.imageDuration || 3;
    }

    
  }

  // Add audio clip last (after both images and text)
  if (config.selectedMusic) {
    const audioClip = {
      asset: {
        type: 'audio',
        src: `https://msmuyhmxlrkcjthugcxd.supabase.co/storage/v1/object/public/background-music/${config.selectedMusic}`,
      },
      start: 0,
      length: totalDuration,
      // Aucun effet ou volume spécifié car non supportés par l'API Shotstack
    };
    clips.push(audioClip);
    console.log(`Clip audio ajouté: ${config.selectedMusic}, durée: ${totalDuration}s`);
  }

  // Vérifie si tous les éléments de texte ont été utilisés
  console.log(`Total clips générés: ${clips.length} avec durée totale de ${totalDuration} secondes`);
  console.log(`Éléments de texte utilisés: ${Math.min(selectedImages.length, textElements.length)} sur ${textElements.length} disponibles`);
  
  return { clips, totalDuration };
};
