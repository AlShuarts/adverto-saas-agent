
export const generateSlideShowClips = (selectedImages: string[], textElements: string[], config: any) => {
  const clips = [];
  let totalDuration = 0;
  const effects = ["slideLeftSlow", "slideRightSlow"];

  selectedImages.forEach((imageUrl: string, index: number) => {
    const effect = effects[index % effects.length];
    const imageClip = {
      asset: {
        type: 'image',
        src: imageUrl,
      },
      start: totalDuration,
      length: config.imageDuration,
      effect: effect,
    };
    clips.push(imageClip);

    // Ajouter une seule information à la fois, en alternant entre les différentes informations
    if (textElements.length > 0 && config.showDetails) {
      // Choisir un élément de texte différent pour chaque image (en rotation)
      const textIndex = index % textElements.length;
      const textToShow = textElements[textIndex];
      
      const textClip = {
        asset: {
          type: "text",
          text: textToShow,
          width: 1000,
          height: 100,
          font: {
            family: "Poppins",
            color: "#ffffff",
            opacity: 0.9, 
            size: 40,
            weight: 600,
            lineHeight: 1.2,
          },
          background: {
            color: "#000000",
            opacity: 0.7,
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
        },
        start: totalDuration,
        length: config.imageDuration,
        offset: {
          x: 0,
          y: 0.4 // Positionne le texte vers le bas de l'image
        },
      };
      clips.push(textClip);
    }

    totalDuration += config.imageDuration;
  });

  return { clips, totalDuration };
};
