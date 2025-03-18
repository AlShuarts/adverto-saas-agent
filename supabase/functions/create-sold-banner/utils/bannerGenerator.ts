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
  const bannerHeight = 200; // Hauteur de la bannière réduite

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

  // 2. Rectangle noir en bas pour la bannière
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

  // 3. Texte "VENDU"
  clips.push({
    asset: {
      type: "text",
      text: "VENDU",
      width: 800,
      height: 100,
      font: {
        family: "Poppins",
        color: "#ffffff",
        opacity: 1.0,
        size: 90,
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
    offset: { x: 0, y: 0.25 }
  });

  // 4. Informations du courtier sous "VENDU"
  const brokerInfo = `${params.brokerName}, ${params.brokerEmail}\n${params.brokerPhone}`;
  clips.push({
    asset: {
      type: "text",
      text: brokerInfo,
      width: 800,
      height: 150,
      font: {
        family: "Poppins",
        color: "#ffffff",
        opacity: 1.0,
        size: 28,
        weight: 400
      },
      alignment: {
        horizontal: "center",
        vertical: "center"
      }
    },
    start: 0,
    length: duration,
    position: "center",
    offset: { x: 0.2, y: 0.05 }
  });

  // 5. Photo du courtier (si fournie)
  if (params.brokerImage) {
    clips.push({
      asset: { 
        type: 'image', 
        src: params.brokerImage 
      },
      start: 0,
      length: duration,
      position: "bottomLeft",
      offset: { x: 0, y: 0 },
      scale: 1
      
    });
  }

  // 6. Logo de l'agence (si fourni)
  if (params.agencyLogo) {
    clips.push({
      asset: { 
        type: 'image', 
        src: params.agencyLogo 
      },
      start: 0,
      length: duration,
      position: "bottomRight",
      offset: { x: 0, y: 0 },
      scale: 1
    });
  }

  // 7. Adresse de la propriété
  if (params.address) {
    clips.push({
      asset: {
        type: "text",
        text: params.address,
        width: 1000,
        height: 50,
        font: {
          family: "Poppins",
          color: "#ffffff",
          opacity: 1.0,
          size: 30,
          weight: 500
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
  }

  console.log(`✅ Total clips générés: ${clips.length}`);

  return { clips, totalDuration: duration };
};
