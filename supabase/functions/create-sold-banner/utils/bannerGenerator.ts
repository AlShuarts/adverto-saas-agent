
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

  // 2. Bande noire en bas
  clips.push({
    asset: {
      type: "rectangle",
      width: 1920,
      height: 400,
      background: {
        color: "#000000",
        opacity: 1
      }
    },
    start: 0,
    length: duration,
    position: "bottom"
  });

  // 3. Texte "VENDU" centré dans la bande noire
  clips.push({
    asset: {
      type: "title",
      text: "VENDU",
      style: "minimal",
      size: "large",
      position: "center",
      color: "#ffffff"
    },
    start: 0,
    length: duration,
    position: "bottom",
    offset: { x: 0, y: 0.25 }
  });

  // 4. Informations du courtier sous "VENDU"
  const brokerInfo = `${params.brokerName}\n${params.brokerEmail}\n${params.brokerPhone}`;
  clips.push({
    asset: {
      type: "title",
      text: brokerInfo,
      style: "minimal",
      size: "small",
      position: "center",
      color: "#ffffff"
    },
    start: 0,
    length: duration,
    position: "bottom",
    offset: { x: 0, y: -0.2 }
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
      offset: { x: 0.15, y: -0.25 },
      scale: 0.35
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
      offset: { x: -0.15, y: -0.25 },
      scale: 0.2
    });
  }

  // 7. Adresse de la propriété
  if (params.address) {
    clips.push({
      asset: {
        type: "title",
        text: params.address,
        style: "minimal",
        size: "medium",
        position: "center",
        color: "#ffffff"
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
