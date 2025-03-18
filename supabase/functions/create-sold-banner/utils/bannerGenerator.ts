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
  const duration = 5; // Durée de la bannière
  const bannerHeight = 250; // Hauteur de la bannière
  const tracks = [];

  console.log(`📸 Génération de la bannière "VENDU" pour l'image ${params.mainImage}`);

  // 1. Piste pour l'image principale (fond)
  tracks.push({
    clips: [{
      asset: { 
        type: 'image', 
        src: params.mainImage 
      },
      start: 0,
      length: duration,
      fit: "cover"
    }]
  });

  // 2. Piste pour le rectangle noir de la bannière
  tracks.push({
    clips: [{
      asset: {
        type: "shape",
        shape: "rectangle",
        width: 1920,
        height: bannerHeight,
        fill: {
          color: "#000000",
          opacity: 1
        },
        rectangle: { // ✅ Ajout correct du rectangle
          width: 1920,
          height: bannerHeight,
          cornerRadius: 0
        }
      },
      start: 0,
      length: duration,
      position: "bottom"
    }]
  });

  // 3. Piste pour le texte "VENDU" centré dans la bannière
  tracks.push({
    clips: [{
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
        background: { // ✅ Correction ici
          color: "#000000",
          opacity: 1
        },
        alignment: {
          horizontal: "center",
          vertical: "center"
        }
      },
      start: 0,
      length: duration,
      position: "bottom",
      offset: { x: 0, y: 0.1 }
    }]
  });

  // 4. Piste pour les informations du courtier à gauche
  const brokerInfo = `${params.brokerName}\n${params.brokerEmail}\n${params.brokerPhone}`;
  tracks.push({
    clips: [{
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
        background: { // ✅ Correction ici aussi
          color: "#000000",
          opacity: 1
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
    }]
  });

  // 5. Piste pour l'image du courtier en bas à gauche
  if (params.brokerImage) {
    tracks.push({
      clips: [{
        asset: { 
          type: 'image', 
          src: params.brokerImage 
        },
        start: 0,
        length: duration,
        position: "bottomLeft",
        offset: { x: 0.1, y: 0.2 }, // Ajustement de position
        scale: 0.25 // Taille réduite pour qu’il ne cache pas le texte
      }]
    });
  }

  // 6. Piste pour le logo de l’agence à droite
  if (params.agencyLogo) {
    tracks.push({
      clips: [{
        asset: { 
          type: 'image', 
          src: params.agencyLogo 
        },
        start: 0,
        length: duration,
        position: "bottomRight",
        offset: { x: -0.1, y: 0.1 },
        scale: 0.2
      }]
    });
  }

  console.log(`✅ Nombre total de pistes générées : ${tracks.length}`);

  return { tracks, totalDuration: duration };
};
