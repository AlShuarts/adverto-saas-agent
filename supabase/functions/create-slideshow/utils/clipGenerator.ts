export const generateSlideShowClips = (selectedImages: string[], textElements: string[], config: any) => {
  const clips = [];
  let totalDuration = 0;
  const effects = ["slideLeftSlow", "slideRightSlow"];

  console.log(`📸 Génération de clips pour ${selectedImages.length} images avec ${textElements.length} éléments de texte`);

  // Ajouter toutes les images
  for (let i = 0; i < selectedImages.length; i++) {
    const imageUrl = selectedImages[i];
    const effect = effects[i % effects.length];

    const imageClip = {
      asset: { type: 'image', src: imageUrl },
      start: totalDuration,
      length: config.imageDuration || 3,
      effect: effect,
      fit: "cover",
      scale: 1.0,
      position: "center",
      opacity: 1.0
    };
    clips.push(imageClip);

    // Ajouter le texte correspondant sous l'image
    if (textElements[i]) {
      console.log(`📝 Ajout du texte pour l'image ${i}: ${textElements[i]}`);
    const textHeight = totalDuration ===0  ? 150 : 50;
      const textClip = {
        asset: {
          type: "text",
          text: textElements[i],
          width: 500,
          height: textHeight,
          font: {
            family: "Poppins",
            color: "#ffffff",
            opacity: 1.0,
            size: 30,
            weight: 500,
            lineHeight: 1.5
          },
          background: {
            color: "#000000",
            opacity: 0.3
          },
          alignment: {
            horizontal: "center",
            vertical: "center"
          }
        },
        start: totalDuration,
        length: config.imageDuration || 3,
        offset: { x: 0, y: -0.4 }
      };
      clips.push(textClip);
    }

    totalDuration += config.imageDuration || 3;
  }

  // Ajouter un clip audio si une musique est sélectionnée
  if (config.selectedMusic) {
    const audioClip = {
      asset: { type: 'audio', src: `https://msmuyhmxlrkcjthugcxd.supabase.co/storage/v1/object/public/background-music/${config.selectedMusic}` },
      start: 0,
      length: totalDuration
    };
    clips.push(audioClip);
    console.log(`🎵 Clip audio ajouté: ${config.selectedMusic}, durée: ${totalDuration}s`);
  }

  console.log(`✅ Total clips générés: ${clips.length} avec une durée totale de ${totalDuration} secondes`);

  return { clips, totalDuration };
};
