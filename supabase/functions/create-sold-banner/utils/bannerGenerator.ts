
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

  console.log(`📸 Génération de bannière "VENDU" pour l'image ${params.mainImage}`);

  // 1. Image principale (fond)
  const mainImageClip = {
    asset: { 
      type: 'image', 
      src: params.mainImage 
    },
    start: 0,
    length: duration,
    fit: "cover",
    scale: 1.0
  };
  console.log("👉 Ajout clip image principale:", JSON.stringify(mainImageClip, null, 2));
  clips.push(mainImageClip);

  // 2. Bannière noire en bas - ajusté pour être complètement opaque et plus haute
  const blackBannerHtml = `
    <div style="
      width: 100%; 
      height: 400px; 
      background-color: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
    "></div>
  `;
  
  const blackBannerClip = {
    asset: {
      type: "html",
      html: blackBannerHtml,
      width: 1920,
      height: 400
    },
    start: 0,
    length: duration,
    position: "bottom"
  };
  console.log("👉 Ajout bannière noire via HTML:", JSON.stringify(blackBannerClip, null, 2));
  clips.push(blackBannerClip);

  // 3. Texte "VENDU" - plus grand et centré
  const venduTextClip = {
    asset: {
      type: "html",
      html: `<div style="
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
      ">
        <p style="
          color: white; 
          font-size: 180px; 
          font-weight: bold; 
          margin: 0; 
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        ">VENDU</p>
      </div>`,
      width: 1920,
      height: 400
    },
    start: 0,
    length: duration,
    position: "center",
    offset: { x: 0, y: -0.15 }
  };
  console.log("👉 Ajout clip texte VENDU:", JSON.stringify(venduTextClip, null, 2));
  clips.push(venduTextClip);

  // 4. Photo du courtier (si fournie) - augmentation de la taille
  if (params.brokerImage) {
    console.log("🖼️ Image du courtier fournie:", params.brokerImage);
    const brokerImageClip = {
      asset: { 
        type: 'image', 
        src: params.brokerImage 
      },
      start: 0,
      length: duration,
      fit: "contain",
      scale: 0.25,     // Augmentation de l'échelle pour une meilleure visibilité
      position: "bottomLeft",
      offset: { x: 0.15, y: 0.15 }
    };
    console.log("👉 Ajout clip photo courtier avec scale:", JSON.stringify(brokerImageClip, null, 2));
    clips.push(brokerImageClip);
  } else {
    console.warn("⚠️ Aucune image de courtier n'a été fournie");
  }

  // 5. Informations du courtier dans le rectangle noir - texte plus grand et meilleur positionnement
  const brokerInfo = `<div style="
    text-align: left; 
    color: white; 
    font-family: Arial, sans-serif;
    padding: 20px;
    width: 100%;
  ">
    <p style="font-size: 40px; font-weight: bold; margin: 0 0 15px 0;">${params.brokerName}</p>
    <p style="font-size: 28px; margin: 0 0 15px 0;">${params.brokerEmail}</p>
    <p style="font-size: 28px; margin: 0;">${params.brokerPhone}</p>
  </div>`;
  
  const brokerInfoClip = {
    asset: {
      type: "html",
      html: brokerInfo,
      width: 700,
      height: 200
    },
    start: 0,
    length: duration,
    position: "bottomLeft",
    offset: { x: 0.42, y: 0.15 }
  };
  console.log("👉 Ajout clip info courtier:", JSON.stringify(brokerInfoClip, null, 2));
  clips.push(brokerInfoClip);

  // 6. Logo de l'agence (si fourni) - augmentation de la taille
  if (params.agencyLogo) {
    console.log("🏢 Logo de l'agence fourni:", params.agencyLogo);
    const agencyLogoClip = {
      asset: { 
        type: 'image', 
        src: params.agencyLogo 
      },
      start: 0,
      length: duration,
      fit: "contain",
      scale: 0.25,    // Augmentation de l'échelle pour une meilleure visibilité
      position: "bottomRight",
      offset: { x: -0.15, y: 0.15 }
    };
    console.log("👉 Ajout clip logo agence avec scale:", JSON.stringify(agencyLogoClip, null, 2));
    clips.push(agencyLogoClip);
  } else {
    console.warn("⚠️ Aucun logo d'agence n'a été fourni");
  }

  console.log(`✅ Total clips générés: ${clips.length}`);
  return { clips, totalDuration: duration };
};
