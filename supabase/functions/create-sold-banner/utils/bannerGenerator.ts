
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
  
  const duration = 5; // Durée statique car c'est une image
  
  console.log(`📸 Génération de bannière "VENDU" pour l'image ${params.mainImage}`);
  
  // Construction des tracks pour la timeline avec l'ordre exact fourni
  const tracks = [
    // Track 1: Texte
    {
      clips: [
        {
          asset: {
            type: "text",
            text: `${params.brokerName}, ${params.brokerEmail} \n\n${params.brokerPhone}`,
            alignment: {
              horizontal: "left",
              vertical: "top"
            },
            font: {
              color: "#ffffff",
              family: "Arapey",
              size: "37",
              lineHeight: 1
            },
            width: 918,
            height: 127
          },
          start: 0,
          length: "auto",
          offset: {
            x: 0.129,
            y: -0.396
          },
          position: "center"
        }
      ]
    },
    
    // Track 2: Ligne blanche
    {
      clips: [
        {
          asset: {
            type: "shape",
            shape: "line",
            fill: {
              color: "#ffffff",
              opacity: 1
            },
            stroke: {
              color: "#000000",
              width: 0
            },
            width: 896,
            height: 4,
            line: {
              length: 896,
              thickness: 4
            }
          },
          start: 0,
          length: "auto",
          offset: {
            x: 0.121,
            y: -0.295
          },
          position: "center"
        }
      ]
    },
    
    // Track 3: Infos courtier en HTML - PROPRIÉTÉ COLOR SUPPRIMÉE
    {
        clips: [
          {
            asset: {
              type: "text",
              text: "VENDU",
              alignment: {
                horizontal: "left",
                vertical: "center"
              },
              font: {
                color: "#fffafa",
                family: "Arapey",
                size: "85",
                lineHeight: 1
              },
              width: 800,
              height: 200
            },
            start: 0,
            length: 3,
            offset: {
              x: 0.083,
              y: -0.221
            },
            position: "center"
          }
        ]
      },
    
    // Track 4: Photo du courtier
    {
      clips: params.brokerImage ? [
        {
          asset: {
            type: "image",
            src: params.brokerImage
          },
          start: 0,
          length: duration,
          position: "center",
          offset: {
            x: -0.411,
            y: -0.327
          },
          scale: 0.353,
          fit: "contain"
        }
      ] : []
    },
    
    // Track 5: Logo de l'agence
    {
      clips: params.agencyLogo ? [
        {
          asset: {
            type: "image",
            src: params.agencyLogo
          },
          start: 0,
          length: duration,
          position: "center",
          offset: {
            x: 0.36,
            y: -0.434
          },
          scale: 0.25,
          fit: "contain"
        }
      ] : []
    },
    
    // Track 6: Rectangle noir (fond de la bannière)
    {
      clips: [
        {
          asset: {
            type: "shape",
            shape: "rectangle",
            width: 1285,
            height: 250,
            fill: {
              color: "#000000",
              opacity: "1"
            },
            rectangle: {
              width: 1285,
              height: 250,
              cornerRadius: 0
            },
            stroke: {
              width: "0"
            }
          },
          start: 0,
          length: duration,
          position: "center",
          offset: {
            x: 0.002,
            y: -0.326
          }
        }
      ]
    },
    
    // Track 7: Image principale (fond) - Doit être en dernier pour être en arrière-plan
    {
      clips: [
        {
          asset: {
            type: "image",
            src: params.mainImage
          },
          start: 0,
          length: duration,
          fit: "cover"
        }
      ]
    }
  ];
  
  console.log(`✅ Total tracks générés: ${tracks.length}`);
  
  return { tracks, totalDuration: duration };
};
