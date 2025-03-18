
export const renderWithShotstack = async (renderPayload: any) => {
  console.log("🚀 Début de la fonction renderWithShotstack");
  try {
    // Vérification de la présence de la clé API
    const apiKey = Deno.env.get("SHOTSTACK_API_KEY");
    if (!apiKey) {
      throw new Error("❌ Clé API Shotstack manquante dans les variables d'environnement.");
    }

    // Validation des images avant l'envoi
    if (renderPayload.timeline.tracks[0].clips.length > 0) {
      const clips = renderPayload.timeline.tracks[0].clips;
      console.log(`🖼️ Validation de ${clips.length} clips avant envoi`);
      
      // Vérification détaillée de chaque clip
      for (let i = 0; i < clips.length; i++) {
        const clip = clips[i];
        console.log(`\n📎 CLIP #${i+1} - Type: ${clip.asset.type}`);
        
        if (clip.asset.type === 'image') {
          console.log(`  URL: ${clip.asset.src.substring(0, 50)}...`);
          console.log(`  Position: ${clip.position || 'default'}`);
          console.log(`  Scale: ${clip.scale || 'default'}`);
          console.log(`  Fit: ${clip.fit || 'default'}`);
          console.log(`  Offset: ${JSON.stringify(clip.offset || {})}`);
          
          // IMPORTANT: Suppression des propriétés non autorisées pour les clips d'image
          if (clip.width !== undefined) {
            console.warn(`⚠️ Suppression de la propriété 'width' non autorisée sur clip #${i+1}`);
            delete clip.width;
          }
          if (clip.height !== undefined) {
            console.warn(`⚠️ Suppression de la propriété 'height' non autorisée sur clip #${i+1}`);
            delete clip.height;
          }
        } 
        else if (clip.asset.type === 'html') {
          console.log(`  HTML content length: ${(clip.asset.html || '').length} chars`);
          console.log(`  Position: ${clip.position || 'default'}`);
          console.log(`  Offset: ${JSON.stringify(clip.offset || {})}`);
          console.log(`  Width: ${clip.asset.width || 'auto'}, Height: ${clip.asset.height || 'auto'}`);
        }
      }
    }

    // Nettoyage profond du payload pour éviter les erreurs
    const cleanRecursively = (obj: any): any => {
      if (obj === null || typeof obj !== 'object') return obj;
      
      const cleaned = Array.isArray(obj) ? [] : {};
      
      for (const key in obj) {
        // Filtrer les valeurs non définies ou nulles
        if (obj[key] !== undefined && obj[key] !== null) {
          // Si c'est un objet, nettoyer récursivement
          if (typeof obj[key] === 'object') {
            const cleanedChild = cleanRecursively(obj[key]);
            if (Object.keys(cleanedChild).length > 0 || Array.isArray(cleanedChild)) {
              cleaned[key] = cleanedChild;
            }
          } else {
            cleaned[key] = obj[key];
          }
        }
      }
      
      return cleaned;
    };

    // Simplification et nettoyage du payload pour éviter les erreurs
    const simplifiedPayload = {
      timeline: {
        background: "#000000",
        tracks: [
          {
            clips: renderPayload.timeline.tracks[0].clips.map((clip: any) => {
              // Nettoyage supplémentaire pour les clips d'image
              if (clip.asset && clip.asset.type === 'image') {
                // S'assurer que width et height ne sont pas présents sur les clips d'image
                const { width, height, ...cleanClip } = clip;
                console.log(`🧹 Nettoyage du clip d'image: ${clip.asset.src.substring(0, 30)}...`);
                return cleanRecursively(cleanClip);
              }
              
              // Appliquer un nettoyage récursif pour enlever toutes les valeurs undefined/null
              return cleanRecursively(clip);
            })
          }
        ]
      },
      output: {
        format: "png",
        resolution: "hd",
        aspectRatio: "16:9"
      },
      callback: renderPayload.callback
    };

    // Log complet du payload final pour debugging
    console.log("\n📝 PAYLOAD FINAL ENVOYÉ À SHOTSTACK:");
    console.log(JSON.stringify(simplifiedPayload, null, 2));

    // Appel à l'API Shotstack avec le payload simplifié
    const response = await fetch("https://api.shotstack.io/v1/render", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(simplifiedPayload),
    });

    console.log("📊 Statut de réponse Shotstack:", response.status);
    
    const responseData = await response.json();
    console.log("📝 Réponse détaillée de Shotstack:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      // Log très détaillé de l'erreur
      console.error("❌ ERREUR API SHOTSTACK - Code:", response.status);
      console.error("❌ Détails de l'erreur:", JSON.stringify(responseData, null, 2));
      
      // Si des détails de validation sont disponibles, les afficher
      if (responseData.response?.error?.details) {
        console.error("🔍 Détails spécifiques de validation:", JSON.stringify(responseData.response.error.details, null, 2));
      }
      
      throw new Error(`Erreur de l'API Shotstack: ${response.status} ${response.statusText} - ${JSON.stringify(responseData)}`);
    }

    const renderId = responseData.response?.id;
    if (!renderId) {
      throw new Error("❌ Réponse invalide de Shotstack: ID de rendu manquant");
    }
    
    console.log("✅ Rendu Shotstack initialisé avec succès, ID:", renderId);
    return renderId;
  } catch (error) {
    console.error("❌ ERREUR CRITIQUE lors de l'appel à Shotstack:", error);
    throw error;
  }
};
