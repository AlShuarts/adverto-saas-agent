// Add appropriate imports at the top (keep existing imports)

export const generateSlideshowTimeline = (selectedImages: string[], textElements: string[], config: any) => {
  console.log("🎬 Génération de la timeline pour", selectedImages.length, "images");
  console.log("Configuration reçue dans clipGenerator:", JSON.stringify(config, null, 2));
  
  // Log the music URL for debugging
  console.log("URL de musique reçue:", config.musicUrl || "aucune");
  
  // Create the timeline structure
  const slideDuration = config.imageDuration || 3;
  const timeline: any = {
    timeline: {
      background: "#000000",
      tracks: [
        // Image track (base layer)
        {
          clips: selectedImages.map((imageUrl, index) => {
            const start = index * slideDuration;
            // Alternate between different effects for visual interest
            const effect = index % 2 === 0 ? "zoomOutSlow" : "slideLeftSlow";
            const scale = index % 2 === 0 ? 1.2 : 1.1;
            
            return {
              asset: {
                type: "image",
                src: imageUrl
              },
              start,
              length: slideDuration,
              effect,
              fit: "cover",
              scale,
              position: "center",
              opacity: 1,
              offset: {
                x: 0,
                y: -0.016
              }
            };
          })
        },
        // Text track (overlay)
        {
          clips: textElements.map((text, index) => {
            const start = index * slideDuration;
            
            return {
              asset: {
                type: "text",
                text: text,
                width: 500,
                height: text.length > 30 ? 150 : 50,
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
              start,
              length: slideDuration,
              position: "center",
              offset: {
                x: 0,
                y: -0.4
              }
            };
          })
        },
      ]
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
  
  // Add audio track if musicUrl is provided
  if (config.musicUrl) {
    console.log("✅ Ajout d'une piste audio avec URL:", config.musicUrl);
    
    // Calculate total duration
    const totalDuration = slideDuration * selectedImages.length;
    
    // Add audio track
    timeline.timeline.tracks.push({
      clips: [
        {
          asset: {
            type: "audio",
            src: config.musicUrl,
            volume: 0.5
          },
          start: 0,
          length: totalDuration
        }
      ]
    });
    
    console.log("✅ Piste audio ajoutée à la timeline avec une durée de", totalDuration, "secondes");
  } else {
    console.log("⚠️ Aucune URL de musique n'a été fournie, aucune piste audio ne sera ajoutée");
  }
  
  // Check if any audio track was added
  const hasAudioTrack = timeline.timeline.tracks.some((track: any) => 
    track.clips && track.clips.some((clip: any) => clip.asset?.type === 'audio')
  );
  
  if (hasAudioTrack) {
    console.log("✅ Timeline générée avec succès avec piste audio");
  } else {
    console.log("⚠️ Aucune piste audio n'a été ajoutée à la timeline");
  }
  
  return timeline;
};
