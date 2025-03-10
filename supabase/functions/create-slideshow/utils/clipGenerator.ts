
export const generateSlideShowClips = (selectedImages: string[], textElements: string[], config: any) => {
  const clips = [];
  let totalDuration = 0;
  const effects = ["slideLeftSlow", "slideRightSlow"];

  console.log(`Génération de clips pour ${selectedImages.length} images avec ${textElements.length} éléments de texte`);
  console.log(`Configuration showDetails: ${config.showDetails}, showPrice: ${config.showPrice}, showAddress: ${config.showAddress}`);

  // On ajoute d'abord un seul élément texte au début du diaporama
  // qui apparaîtra sur toutes les images
  if (textElements.length > 0 && config.showDetails) {
    const textToShow = textElements[0]; // On utilise uniquement le premier (et seul) élément
    
    console.log(`Ajout du texte pour tout le diaporama: ${textToShow}`);
    
    const textClip = {
      asset: {
        type: "text",
        text: textToShow,
        width: 500,
        height: 150, // Augmenté pour accommoder plusieurs lignes
        font: {
          family: "Poppins",
          color: "#ffffff",
          opacity: 1.0, 
          size: 30,
          weight: 600, // Un peu plus gras pour meilleure lisibilité
          lineHeight: 1.5, // Augmenté pour l'espacement des lignes
        },
        background: {
          color: "#000000",
          opacity: 0.6, // Plus opaque pour meilleur contraste
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
        // Padding est supprimé car non supporté par l'API
      },
      start: 0, // Commence au début
      length: totalDuration + (selectedImages.length * (config.imageDuration || 3)), // Dure pendant tout le diaporama
      offset: {
        x: 0,
        y: -15 // Position vers le bas de l'image
      },
    };
    clips.push(textClip);
  } else {
    console.log(`Aucun texte ajouté. showDetails: ${config.showDetails}, textElements.length: ${textElements.length}`);
  }

  // Ensuite on ajoute les clips d'images
  selectedImages.forEach((imageUrl: string, index: number) => {
    const effect = effects[index % effects.length];
    
    // Ajout du clip d'image
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
  });

  console.log(`Total clips générés: ${clips.length} avec durée totale de ${totalDuration} secondes`);
  return { clips, totalDuration };
};
