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

  // 2. Rectangle noir en bas simulant une bannière
  clips.push({
    asset: {
      type: "shape",
      shape: "rectangle",
      width: 1920, // Largeur en pixels
      height: 350, // Hauteur ajustée pour la bannière
      fill: {
        color: "#000000",
        opacity: 1
      },
      rectangle: {
        width: 1920,
        height: 350,
        cornerRadius: 0 // Pas d’arrondi sur les coins
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
        size: 80,
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
    offset: { x: 0, y: 0.15 }
  });

  // 4. Informations du courtier sous "VENDU"
  const brokerInfo = `${params.brokerName}\n${params.brokerEmail}\n${params.brokerPhone}`;
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
        size: 30,
        weight: 400
      },
      alignment: {
        horizontal: "center",
        vertical: "bottom"
      }
    },
    start: 0,
    length: duration,
    position: "bottom",
    offset: { x: 0, y: -0.1 }
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
      offset: { x: 0.2, y: -0.2 },
      scale: 0.3,
      transition: {
        in: "fade"
      }
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
      offset: { x: -0.2, y: -0.2 },
      scale: 0.15,
      transition: {
        in: "fade"
      }
    });
  }

  // 7. Adresse de la propriété
  if (params.address) {
    clips.push({
      asset: {
        type: "text",
        text: params.address,
        width: 800,
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
