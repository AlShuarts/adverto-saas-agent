
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

  // 2. Texte "VENDU" centré
  clips.push({
    asset: {
      type: "text",
      text: "VENDU",
      width: 1000,
      height: 200,
      font: {
        family: "Poppins",
        color: "#ffffff",
        opacity: 1.0,
        size: 60,
        weight: 700
      },
      background: {
        color: "#000000",
        opacity: 0.8
      },
      alignment: {
        horizontal: "center",
        vertical: "center"
      }
    },
    start: 0,
    length: duration,
    position: "center"
  });

  // 3. Informations du courtier
  const brokerInfo = `${params.brokerName}\n${params.brokerEmail}\n${params.brokerPhone}`;
  clips.push({
    asset: {
      type: "text",
      text: brokerInfo,
      width: 1000,
      height: 150,
      font: {
        family: "Poppins",
        color: "#ffffff",
        opacity: 1.0,
        size: 25,
        weight: 400
      },
      background: {
        color: "#000000",
        opacity: 0.8
      },
      alignment: {
        horizontal: "center",
        vertical: "bottom"
      }
    },
    start: 0,
    length: duration,
    offset: { x: 0, y: -0.15 }
  });

  // 4. Photo du courtier (si fournie)
  if (params.brokerImage) {
    clips.push({
      asset: { 
        type: 'image', 
        src: params.brokerImage 
      },
      start: 0,
      length: duration,
      position: "bottom-left",
      offset: { x: 0.4, y: -0.3 },
      scale: 0.3,
      transition: {
        in: "fade"
      }
    });
  }

  // 5. Logo de l'agence (si fourni)
  if (params.agencyLogo) {
    clips.push({
      asset: { 
        type: 'image', 
        src: params.agencyLogo 
      },
      start: 0,
      length: duration,
      position: "bottom-right",
      offset: { x: -0.4, y: -0.3 },
      scale: 0.2,
      transition: {
        in: "fade"
      }
    });
  }

  // 6. Adresse de la propriété
  if (params.address) {
    clips.push({
      asset: {
        type: "text",
        text: params.address,
        width: 1000,
        height: 80,
        font: {
          family: "Poppins",
          color: "#ffffff",
          opacity: 1.0,
          size: 30,
          weight: 500
        },
        background: {
          color: "#000000",
          opacity: 0.8
        },
        alignment: {
          horizontal: "center",
          vertical: "top"
        }
      },
      start: 0,
      length: duration,
      position: "top",
      offset: { x: 0, y: 0.35 }
    });
  }

  console.log(`✅ Total clips générés: ${clips.length}`);

  return { clips, totalDuration: duration };
};
