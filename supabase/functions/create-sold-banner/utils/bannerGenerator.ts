
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

  // 1. Image principale (fond) - Toujours en premier plan
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

  // 2. Texte "VENDU" - Centré et grand au milieu de l'image principale
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
          font-size: 200px; 
          font-weight: bold; 
          margin: 0; 
          text-shadow: 4px 4px 8px rgba(0,0,0,0.7);
        ">VENDU</p>
      </div>`,
      width: 1920,
      height: 400
    },
    start: 0,
    length: duration,
    position: "center"
  };
  console.log("👉 Ajout clip texte VENDU:", JSON.stringify(venduTextClip, null, 2));
  clips.push(venduTextClip);

  // 3. Bannière noire en bas - APRÈS le texte VENDU mais AVANT les autres éléments
  const blackBannerHeight = 320; // Hauteur fixe pour le bandeau noir
  const blackBannerHtml = `
    <div style="
      width: 100%; 
      height: ${blackBannerHeight}px; 
      background-color: #000000;
    "></div>
  `;
  
  const blackBannerClip = {
    asset: {
      type: "html",
      html: blackBannerHtml,
      width: 1920,
      height: blackBannerHeight
    },
    start: 0,
    length: duration,
    position: "bottom"
  };
  console.log("👉 Ajout bannière noire via HTML:", JSON.stringify(blackBannerClip, null, 2));
  clips.push(blackBannerClip);

  // 4. Photo du courtier (si fournie) - APRÈS le bandeau noir pour être par-dessus
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
      scale: 0.22,     // Taille appropriée
      position: "bottomLeft",
      offset: { x: 0.05, y: -0.03 }  // Ajusté pour être dans le bandeau noir et décalé du bord
    };
    console.log("👉 Ajout clip photo courtier avec scale:", JSON.stringify(brokerImageClip, null, 2));
    clips.push(brokerImageClip);
  } else {
    console.warn("⚠️ Aucune image de courtier n'a été fournie");
  }

  // 5. Informations du courtier - APRÈS la photo du courtier
  const brokerInfo = `<div style="
    text-align: left; 
    color: white; 
    font-family: Arial, sans-serif;
    padding: 10px;
    width: 100%;
  ">
    <p style="font-size: 32px; font-weight: bold; margin: 0 0 10px 0;">${params.brokerName}</p>
    <p style="font-size: 24px; margin: 0 0 8px 0;">${params.brokerEmail}</p>
    <p style="font-size: 24px; margin: 0;">${params.brokerPhone}</p>
  </div>`;
  
  const brokerInfoClip = {
    asset: {
      type: "html",
      html: brokerInfo,
      width: 650,
      height: 150
    },
    start: 0,
    length: duration,
    position: "bottomLeft",
    offset: { x: 0.28, y: -0.03 }  // Ajusté pour être à côté de la photo du courtier
  };
  console.log("👉 Ajout clip info courtier:", JSON.stringify(brokerInfoClip, null, 2));
  clips.push(brokerInfoClip);

  // 6. Logo de l'agence (si fourni) - Dernier élément, pour être par-dessus tout
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
      scale: 0.18,    // Taille appropriée
      position: "bottomRight",
      offset: { x: -0.05, y: -0.03 }  // Ajusté pour être dans le coin droit du bandeau
    };
    console.log("👉 Ajout clip logo agence avec scale:", JSON.stringify(agencyLogoClip, null, 2));
    clips.push(agencyLogoClip);
  } else {
    console.warn("⚠️ Aucun logo d'agence n'a été fourni");
  }

  console.log(`✅ Total clips générés: ${clips.length}`);
  return { clips, totalDuration: duration };
};
