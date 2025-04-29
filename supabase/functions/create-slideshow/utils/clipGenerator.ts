
import { SlideshowConfig } from "../types/config.ts";

export const generateSlideshowTimeline = (selectedImages: string[], textElements: string[], config: SlideshowConfig) => {
  console.log("🎬 Génération de la timeline pour", selectedImages.length, "images");
  console.log("Configuration reçue dans clipGenerator:", JSON.stringify(config, null, 2));
  console.log("URL de musique reçue:", config.musicUrl || "aucune");
  
  const tracks = [];
  const imageDuration = config.imageDuration || 3;
  const totalDuration = selectedImages.length * imageDuration;
  
  // Piste du texte - DÉPLACÉ AVANT les images
  if (textElements && textElements.length > 0) {
    const textClips = [];
    
    // Texte d'adresse
    if (textElements[0] && config.showAddress) {
      textClips.push({
        asset: {
          type: "text",
          text: textElements[0],
          width: 500,
          height: 150,
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
        start: 0,
        length: imageDuration,
        position: "center",
        offset: {
          x: 0, 
          y: -0.4
        }
      });
    }
    
    // Texte de prix
    if (textElements[1] && config.showPrice) {
      textClips.push({
        asset: {
          type: "text",
          text: textElements[1],
          width: 500,
          height: 50,
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
        start: imageDuration,
        length: imageDuration,
        position: "center",
        offset: {
          x: 0, 
          y: -0.4
        }
      });
    }
    
    if (textClips.length > 0) {
      tracks.push({
        clips: textClips
      });
    }
  }

  // Piste des images - DÉPLACÉ APRÈS le texte
  const imageTrack = {
    clips: selectedImages.map((imageUrl, index) => {
      const start = index * imageDuration;
      
      const effects = ["slideLeftSlow", "slideRightSlow", "slideUpSlow", "slideDownSlow", "zoomInSlow", "zoomOutSlow"];
      const randomEffect = effects[Math.floor(Math.random() * effects.length)];

      const scaleOptions = [1, 1.1, 1.2, 1.413];
      const randomScale = scaleOptions[Math.floor(Math.random() * scaleOptions.length)];
      
      const offsetOptions = [
        {x: 0, y: 0}, 
        {x: 0.041, y: 0}, 
        {x: -0.016, y: 0},
        {x: 0, y: 0.016},
        {x: 0, y: -0.016}
      ];
      const randomOffset = offsetOptions[Math.floor(Math.random() * offsetOptions.length)];

      return {
        asset: {
          type: "image",
          src: imageUrl
        },
        start,
        length: imageDuration,
        effect: randomEffect,
        fit: "cover",
        scale: randomScale,
        position: "center",
        opacity: 1,
        offset: randomOffset
      };
    })
  };
  tracks.push(imageTrack);

  // Piste audio - CORRECTION: Ne pas utiliser la propriété "volume" qui n'est pas supportée
  if (config.musicUrl) {
    console.log("🎵 Ajout de la piste audio avec la musique:", config.musicUrl);
    tracks.push({
      clips: [
        {
          asset: {
            type: "audio",
            src: config.musicUrl,
            effect: "fadeOut"
          },
          start: 0,
          length: totalDuration
          // La propriété "volume" a été supprimée car elle n'est pas supportée par l'API Shotstack
        }
      ]
    });
  } else {
    console.log("⚠️ Aucune URL de musique n'a été fournie, aucune piste audio ne sera ajoutée");
  }
  
  // Vérifier si chaque piste contient des clips
  for (const track of tracks) {
    if (!track.clips || track.clips.length === 0) {
      console.warn("⚠️ Une piste sans clips a été détectée");
    }
  }
  
  // Vérification de la présence d'une piste audio
  const hasAudioTrack = tracks.some(track => 
    track.clips && track.clips.some(clip => clip.asset?.type === 'audio')
  );
  
  if (hasAudioTrack) {
    console.log("✅ Piste audio ajoutée à la timeline");
  } else {
    console.log("⚠️ Aucune piste audio n'a été ajoutée à la timeline");
  }
  
  console.log("✅ Timeline générée avec succès");
  
  return {
    timeline: {
      background: "#000000",
      tracks
    },
    output: {
      format: "mp4",
      fps: 25,
      size: {
        width: 1280,
        height: 720
      }
    }
  };
};
