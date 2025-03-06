
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

    // Add text information for each image if textElements exist and showDetails is enabled
    if (textElements.length > 0 && config.showDetails) {
      // Choose a different text element for each image (rotating through the available elements)
      const textIndex = index % textElements.length;
      const textToShow = textElements[textIndex];
      
      const textClip = {
        asset: {
          type: "text",
          text: textToShow,
          width: 1000,
          height: 120,
          font: {
            family: "Poppins",
            color: "#ffffff",
            opacity: 1.0, 
            size: 40,
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
        },
        start: totalDuration,
        length: config.imageDuration,
        offset: {
          x: 0,
          y: 0.4 // Position text towards the bottom of the image
        },
      };
      clips.push(textClip);
    }

    totalDuration += config.imageDuration;
  });

  return { clips, totalDuration };
};
