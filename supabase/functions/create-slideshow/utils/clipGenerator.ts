
export const generateSlideShowClips = (selectedImages: string[], textElements: string[], config: any) => {
  const clips = [];
  let totalDuration = 0;
  const effects = ["slideLeftSlow", "slideRightSlow"];

  console.log(`Génération de clips pour ${selectedImages.length} images avec ${textElements.length} éléments de texte`);
  console.log(`Configuration showDetails: ${config.showDetails}, showPrice: ${config.showPrice}, showAddress: ${config.showAddress}`);

  selectedImages.forEach((imageUrl: string, index: number) => {
    const effect = effects[index % effects.length];
    const imageClip = {
      asset: {
        type: 'image',
        src: imageUrl,
      },
      start: totalDuration,
      length: config.imageDuration || 3,
      effect: effect,
    };
    clips.push(imageClip);

    // Add text information for each image if textElements exist and showDetails is enabled
    if (textElements.length > 0 && config.showDetails) {
      // Choose a different text element for each image (rotating through the available elements)
      const textIndex = index % textElements.length;
      const textToShow = textElements[textIndex];
      
      console.log(`Ajout du texte pour l'image ${index}: ${textToShow}`);
      
      const textClip = {
        asset: {
          type: "text",
          text: textToShow,
          width: 1000,
          height: 150,
          font: {
            family: "Poppins",
            color: "#ffffff",
            opacity: 1.0, 
            size: 50,
            weight: 700,
            lineHeight: 1.4,
          },
          background: {
            color: "#000000",
            opacity: 0.8,
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
          padding: 20,
        },
        start: totalDuration,
        length: config.imageDuration || 3,
        offset: {
          x: 0,
          y: 0.4 // Position text towards the bottom of the image
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
