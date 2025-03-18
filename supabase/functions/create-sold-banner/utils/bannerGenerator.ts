
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
  console.log("🔍 Début de generateSoldBannerClip avec params:", JSON.stringify(params, null, 2));
  
  const clips = [];
  const duration = 5; // Durée statique car c'est une image
  const bannerHeight = 200; // Hauteur de la bannière réduite

  console.log(`📸 Génération de bannière "VENDU" pour l'image ${params.mainImage}`);

  // 1. Image principale (fond)
  const mainImageClip = {
    asset: { 
      type: 'image', 
      src: params.mainImage 
    },
    start: 0,
    length: duration,
    fit: "cover"
  };
  console.log("👉 Ajout clip image principale:", JSON.stringify(mainImageClip, null, 2));
  clips.push(mainImageClip);

  // 2. Rectangle noir en bas pour la bannière
  const rectangleClip = {
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
  };
  console.log("👉 Ajout clip rectangle:", JSON.stringify(rectangleClip, null, 2));
  clips.push(rectangleClip);

  // 3. Texte "VENDU"
  const venduTextClip = {
    asset: {
      type: "html",
      html: "<p style='color: white; font-size: 90px; font-weight: bold; text-align: center;'>VENDU</p>",
      width: 800,
      height: 100
    },
    start: 0,
    length: duration,
    position: "bottom",
    offset: { x: 0, y: 0.25 }
  };
  console.log("👉 Ajout clip texte VENDU:", JSON.stringify(venduTextClip, null, 2));
  clips.push(venduTextClip);

  // 4. Informations du courtier sous "VENDU"
  const brokerInfo = `${params.brokerName}, ${params.brokerEmail}\n${params.brokerPhone}`;
  const brokerInfoClip = {
    asset: {
      type: "html",
      html: `<p style='color: white; font-size: 28px; text-align: center;'>${brokerInfo}</p>`,
      width: 800,
      height: 150
    },
    start: 0,
    length: duration,
    position: "center",
    offset: { x: 0.2, y: 0.05 }
  };
  console.log("👉 Ajout clip info courtier:", JSON.stringify(brokerInfoClip, null, 2));
  clips.push(brokerInfoClip);

  // 5. Photo du courtier (si fournie)
  if (params.brokerImage) {
    const brokerImageClip = {
      asset: { 
        type: 'image', 
        src: params.brokerImage 
      },
      start: 0,
      length: duration,
      position: "bottomLeft",
      offset: { x: 0.1, y: 0.05 },
      scale: 0.35
    };
    console.log("👉 Ajout clip photo courtier:", JSON.stringify(brokerImageClip, null, 2));
    clips.push(brokerImageClip);
  }

  // 6. Logo de l'agence (si fourni)
  if (params.agencyLogo) {
    const agencyLogoClip = {
      asset: { 
        type: 'image', 
        src: params.agencyLogo 
      },
      start: 0,
      length: duration,
      position: "bottomRight",
      offset: { x: -0.1, y: 0.05 },
      scale: 0.15
    };
    console.log("👉 Ajout clip logo agence:", JSON.stringify(agencyLogoClip, null, 2));
    clips.push(agencyLogoClip);
  }

  // 7. Adresse de la propriété
  if (params.address) {
    const addressClip = {
      asset: {
        type: "html",
        html: `<p style='color: white; font-size: 30px; font-weight: 500; text-align: center;'>${params.address}</p>`,
        width: 1000,
        height: 50
      },
      start: 0,
      length: duration,
      position: "bottom",
      offset: { x: 0, y: 0.1 }
    };
    console.log("👉 Ajout clip adresse:", JSON.stringify(addressClip, null, 2));
    clips.push(addressClip);
  }

  console.log(`✅ Total clips générés: ${clips.length}`);
  return { clips, totalDuration: duration };
};
