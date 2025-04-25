
export const generateSlideshowTimeline = (selectedImages: string[], textElements: string[], config: any) => {
  console.log("🎬 Génération de la timeline pour", selectedImages.length, "images");
  const tracks: any[] = [];
  const duration = config.imageDuration || 3;
  let currentStart = 0;

  // Track pour les images
  const imageClips: any[] = [];
  
  selectedImages.forEach((imageUrl, index) => {
    // Image clip
    imageClips.push({
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

    currentStart += duration;
  });

  // Ajout du track d'images
  tracks.push({
    clips: imageClips
  });

  // Track pour les textes si disponibles
  if (textElements.length > 0) {
    const textClips: any[] = [];
    currentStart = 0;
    
    textElements.forEach((text, index) => {
      if (text) {
        textClips.push({
          asset: {
            type: "text",
            text: text,
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
    
    // N'ajouter le track de texte que s'il y a effectivement des clips de texte
    if (textClips.length > 0) {
      tracks.push({
        clips: textClips
      });
    }
  }

  // Audio track configuration
  if (config.musicUrl) {
    console.log("🎵 Ajout de la musique:", config.musicUrl);
    tracks.push({
      clips: [
        {
          asset: {
            type: "audio",
            src: config.musicUrl
          },
          effect: "fadeInFadeOut"
        }
      ]
    });
  } else if (config.selectedMusic) {
    // Utilisation de la musique sélectionnée depuis le bucket Supabase
    const musicUrl = `https://msmuyhmxlrkcjthugcxd.supabase.co/storage/v1/object/public/background-music/${config.selectedMusic}`;
    console.log("🎵 Ajout de la musique sélectionnée:", musicUrl);
    tracks.push({
      clips: [
        {
          asset: {
            type: "audio",
            src: musicUrl
          },
          effect: "fadeInFadeOut"
        }
      ]
    });
  }

  const timeline = {
    background: "#000000",
    tracks: tracks
  };

  console.log("✅ Timeline générée avec succès");
  return timeline;
};
