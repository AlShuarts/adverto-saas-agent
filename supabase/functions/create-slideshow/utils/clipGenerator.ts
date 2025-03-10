
export const generateSlideShowClips = (selectedImages: string[], textElements: string[], config: any) => {
  const clips = [];
  let totalDuration = 0;
  const effects = ["slideLeftSlow", "slideRightSlow"];

  console.log(`Génération de clips pour ${selectedImages.length} images avec ${textElements.length} éléments de texte`);
  console.log(`Configuration showDetails: ${config.showDetails}, showPrice: ${config.showPrice}, showAddress: ${config.showAddress}`);

  // On ajoute les clips d'images et de texte
  // On s'assure de ne pas dépasser le nombre d'éléments de texte disponibles
  const maxTextElements = Math.min(selectedImages.length, textElements.length);

  selectedImages.forEach((imageUrl: string, index: number) => {
    const effect = effects[index % effects.length];
    
    
    
    // Ajout du texte uniquement si on n'a pas encore utilisé tous les textes
    if (index < maxTextElements && config.showDetails) {
      const textToShow = textElements[index];
      
      console.log(`Ajout du texte pour l'image ${index}: ${textToShow}`);
      
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
          y: -0.4
        },
      };
      clips.push(textClip);
    }
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

