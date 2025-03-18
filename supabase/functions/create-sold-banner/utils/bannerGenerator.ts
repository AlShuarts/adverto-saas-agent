
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
  const bannerHeight = 250; // Hauteur de la bannière augmentée

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
        opacity: 0.9 // Légère transparence
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

  // 3. Texte "VENDU" - grand et bien visible
  const venduTextClip = {
    asset: {
      type: "html",
      html: "<p style='color: white; font-size: 120px; font-weight: bold; text-align: center; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);'>VENDU</p>",
      width: 800,
      height: 150
    },
    start: 0,
    length: duration,
    position: "bottom",
    offset: { x: 0, y: 0.25 }
  };
  console.log("👉 Ajout clip texte VENDU:", JSON.stringify(venduTextClip, null, 2));
  clips.push(venduTextClip);

  // Position pour le bloc des informations du courtier
  let brokerInfoPosition = "bottomLeft";
  let brokerInfoOffset = { x: 0.32, y: 0.05 };
  
  // Ajuster la position si l'image du courtier est présente
  if (params.brokerImage) {
    brokerInfoPosition = "bottomLeft";
    brokerInfoOffset = { x: 0.38, y: 0.05 };
  }

  // 4. Informations du courtier dans le rectangle noir - aligné à gauche et bien structuré
  const brokerInfo = `<div style='text-align: left;'>
    <p style='font-size: 28px; font-weight: bold; margin: 0 0 5px 0;'>${params.brokerName}</p>
    <p style='font-size: 24px; margin: 0 0 5px 0;'>${params.brokerEmail}</p>
    <p style='font-size: 24px; margin: 0;'>${params.brokerPhone}</p>
  </div>`;
  
  const brokerInfoClip = {
    asset: {
      type: "html",
      html: `<div style='color: white; font-family: Arial, sans-serif;'>${brokerInfo}</div>`,
      width: 800,
      height: 150
    },
    start: 0,
    length: duration,
    position: brokerInfoPosition,
    offset: brokerInfoOffset
  };
  console.log("👉 Ajout clip info courtier:", JSON.stringify(brokerInfoClip, null, 2));
  clips.push(brokerInfoClip);

  // 5. Photo du courtier (si fournie) - plus grande et bien placée
  if (params.brokerImage) {
    console.log("🖼️ Image du courtier fournie:", params.brokerImage);
    const brokerImageClip = {
      asset: { 
        type: 'image', 
        src: params.brokerImage 
      },
      start: 0,
      length: duration,
      position: "bottomLeft",
      offset: { x: 0.1, y: 0.05 },
      scale: 0.45, // Échelle augmentée
      fit: "contain"
    };
    console.log("👉 Ajout clip photo courtier:", JSON.stringify(brokerImageClip, null, 2));
    clips.push(brokerImageClip);
  } else {
    console.warn("⚠️ Aucune image de courtier n'a été fournie");
  }

  // 6. Logo de l'agence (si fourni) - bien placé à droite
  if (params.agencyLogo) {
    console.log("🏢 Logo de l'agence fourni:", params.agencyLogo);
    const agencyLogoClip = {
      asset: { 
        type: 'image', 
        src: params.agencyLogo 
      },
      start: 0,
      length: duration,
      position: "bottomRight",
      offset: { x: -0.1, y: 0.05 },
      scale: 0.25, // Échelle augmentée
      fit: "contain"
    };
    console.log("👉 Ajout clip logo agence:", JSON.stringify(agencyLogoClip, null, 2));
    clips.push(agencyLogoClip);
  } else {
    console.warn("⚠️ Aucun logo d'agence n'a été fourni");
  }

  console.log(`✅ Total clips générés: ${clips.length}`);
  return { clips, totalDuration: duration };
};
