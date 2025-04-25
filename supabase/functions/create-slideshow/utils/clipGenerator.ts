
export const generateSlideshowTimeline = (selectedImages: string[], textElements: string[], config: any) => {
  console.log("🎬 Génération de la timeline pour", selectedImages.length, "images");
  const slides: any[] = [];
  const duration = config.imageDuration || 3;
  let currentStart = 0;

  selectedImages.forEach((imageUrl, index) => {
    // Image clip
    slides.push({
      asset: {
        type: "image",
        src: imageUrl
      },
      start: currentStart,
      length: duration,
      effect: "zoomIn",
      transition: {
        in: index === 0 ? "fade" : "fade",
        out: "fade"
      },
      fit: "cover"
    });

    // Text clip if available
    if (textElements[index]) {
      slides.push({
        asset: {
          type: "text",
          text: textElements[index],
          style: "minimal",
          size: "x-large"
        },
        start: currentStart,
        length: duration,
        position: "bottom",
        transition: {
          in: "fade",
          out: "fade"
        }
      });
    }

    currentStart += duration;
  });

  // Audio track configuration
  let soundtrack = null;
  if (config.musicUrl) {
    console.log("🎵 Ajout de la musique:", config.musicUrl);
    soundtrack = {
      asset: {
        type: "audio",
        src: config.musicUrl
      },
      effect: "fadeInFadeOut"
    };
  }

  const timeline = {
    background: "#000000",
    tracks: [
      ...slides,
      ...(soundtrack ? [soundtrack] : [])
    ]
  };

  console.log("✅ Timeline générée avec succès");
  return timeline;
};
