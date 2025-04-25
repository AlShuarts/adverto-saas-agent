
export const generateSlideshowTimeline = (selectedImages: string[], textElements: string[], config: any) => {
  console.log("🎬 Génération de la timeline pour", selectedImages.length, "images");
  const tracks: any[] = [];
  const duration = config.imageDuration || 3;
  let totalDuration = selectedImages.length * duration;
  
  // Track pour les textes
  const textClips: any[] = [];
  
  textElements.forEach((text, index) => {
    if (text) {
      textClips.push({
        asset: {
          type: "text",
          text: text,
          width: 500,
          height: index === 0 ? 150 : 50, // Premier texte plus haut pour l'adresse
          font: {
            family: "Poppins",
            color: "#ffffff",
            opacity: 1,
            size: 30,
            weight: 500,
            lineHeight: 1.5
          },
          background: {
            color: "#000000",
            opacity: 0.3,
            borderRadius: 0,
            padding: 1
          },
          alignment: {
            horizontal: "center",
            vertical: "center"
          }
        },
        start: index * duration,
        length: duration,
        offset: {
          x: 0,
          y: -0.4
        },
        position: "center"
      });
    }
  });

  if (textClips.length > 0) {
    tracks.push({
      clips: textClips
    });
  }

  // Track pour les images
  const imageClips: any[] = [];
  
  selectedImages.forEach((imageUrl, index) => {
    const isFirst = index === 0;
    const effect = index % 2 === 0 ? "slideLeftSlow" : "slideRightSlow";
    const offset = {
      x: index % 2 === 0 ? 0.041 : (index % 3 === 0 ? -0.037 : index % 5 === 0 ? 0.027 : -0.016),
      y: 0
    };
    
    imageClips.push({
      asset: {
        type: "image",
        src: imageUrl
      },
      start: index * duration,
      length: duration,
      effect: effect,
      fit: "cover",
      scale: isFirst ? 1.413 : 1,
      position: "center",
      opacity: 1,
      offset: offset
    });
  });

  if (imageClips.length > 0) {
    tracks.push({
      clips: imageClips
    });
  }

  // Track audio
  if (config.musicUrl) {
    console.log("🎵 Ajout de la musique:", config.musicUrl);
    
    tracks.push({
      clips: [{
        asset: {
          type: "audio",
          src: config.musicUrl,
          volume: 1
        },
        start: 0,
        length: totalDuration
      }]
    });
  }

  const timeline = {
    background: "#000000",
    tracks: tracks
  };

  // Configuration de sortie améliorée
  const output = {
    format: "mp4",
    fps: 25,
    size: {
      width: 1280,
      height: 720
    }
  };

  console.log("✅ Timeline générée avec succès");
  return { timeline, output };
};
