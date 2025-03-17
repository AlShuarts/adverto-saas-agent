type SoldBannerConfig = {
  mainImage: string;
  brokerImage: string | null;
  agencyLogo: string | null;
  brokerName: string;
  brokerEmail: string;
  brokerPhone: string;
  address: string;
  config: any;
};

export const generateSoldBannerClip = (params: SoldBannerConfig) => {
  const clips = [];
  const duration = 5; // Durée statique car c'est une image
  const bannerHeight = 250; // Hauteur ajustée

  console.log(`📸 Génération de bannière "VENDU" pour l'image ${params.mainImage}`);

  // 1. Image principale (fond)
  clips.push({
    asset: { 
      type: 'image', 
      src: params.mainImage 
    },
    start: 0,
    length: duration,
    fit: "cover"
  });

  // 2. Rectangle noir pour la bannière
  clips.push({
    asset: {
      type: "shape",
      shape: "rectangle",
      width: 1920, 
      height: bannerHeight, 
      fill: {
        color: "#000000",
        opacity: 1
      },
      rectangle: {
        width: 1920,
        height: bannerHeight,
        cornerRadius: 0
      }
    },
    start: 0,
    length: duration,
    position: "bottom"
  });

  // 3. Texte "VENDU" centré dans la bannière
  clips.push({
    asset: {
      type: "text",
      text: "VENDU",
      width: 500,
      height: 100,
      font: {
        family: "Poppins",
        color: "#ffffff",
        opacity: 1.0,
        size: 100,
        weight: 700
      },
      alignment: {
        horizontal: "center",
        vertical: "top"
      }
    },
    start: 0,
    length: duration,
    position: "bottom",
    offset: { x: 0, y: 0.1 }
  });

  // 4. Informations du courtier à gauche
  const brokerInfo = `${params.brokerName}\n${params.brokerEmail}\n${params.brokerPhone}`;
  clips.push({
    asset: {
      type: "text",
      text: brokerInfo,
      width: 500,
      height: 120,
      font: {
        family: "Poppins",
        color: "#ffffff",
        opacity: 1.0,
        size: 28,
        weight: 400
      },
      alignment: {
        horizontal: "left",
        vertical: "center"
      }
    },
    start: 0,
    length: duration,
    position: "bottomLeft",
    offset: { x: 0.25, y: 0.2 }
  });

  // 5. Image du courtier en bas à gauche
  if (params.brokerImage) {
    clips.push({
      asset: { 
        type: 'image', 
        src: params.brokerImage 
      },
      start: 0,
      length: duration,
      position: "bottomLeft",
      offset: { x: 0.1, y: 0.2 }, // Ajustement de position
      scale: 0.25, // Taille réduite pour qu’il ne cache pas le texte
      
    });
  }

  // 6. Logo de l’agence à droite
  if (params.agencyLogo) {
    clips.push({
      asset: { 
        type: 'image', 
        src: params.agencyLogo 
      },
      start: 0,
      length: duration,
      position: "bottomRight",
      offset: { x: -0.1, y: 0.1 },
      scale: 0.2,
    
    });
  }

  console.log(`✅ Total clips générés: ${clips.length}`);

  return { clips, totalDuration: duration };
};
