
export const generateSlideShowClips = (selectedImages: string[], textElements: string[], config: any) => {
  const clips = [];
  let totalDuration = 0;
  const effects = ["slideLeftSlow", "slideRightSlow"];

  console.log(`Génération de clips pour ${selectedImages.length} images avec ${textElements.length} éléments de texte`);
  console.log(`Configuration showDetails: ${config.showDetails}, showPrice: ${config.showPrice}, showAddress: ${config.showAddress}`);

  // On ajoute les clips d'images et de texte en alternance
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
    
    // Ajout du texte correspondant à cette image
    // On utilise modulo pour faire tourner les textes si on a plus d'images que de textes
    if (textElements.length > 0 && config.showDetails) {
      const textIndex = index % textElements.length;
      const textToShow = textElements[textIndex];
      
      console.log(`Ajout du texte pour l'image ${index}: ${textToShow} (index texte: ${textIndex})`);
      
      const textClip = {
        asset: {
          type: "text",
          text: textToShow,
          width: 500,
          height: 150,
          font: {
            family: "Poppins",
            color: "#ffffff",
            opacity: 1.0,
            size: 30,
            weight: 600,
            lineHeight: 1.5,
          },
          background: {
            color: "#000000",
            opacity: 0.6,
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
        },
        start: totalDuration,
        length: config.imageDuration || 3,
        offset: {
          x: 0,
          y: -15
        },
      };
      clips.push(textClip);
    } else {
      console.log(`Aucun texte ajouté pour l'image ${index}. showDetails: ${config.showDetails}, textElements.length: ${textElements.length}`);
    }

    totalDuration += config.imageDuration || 3;
  });

  console.log(`Total clips générés: ${clips.length} avec durée totale de ${totalDuration} secondes`);
  return { clips, totalDuration };
};
