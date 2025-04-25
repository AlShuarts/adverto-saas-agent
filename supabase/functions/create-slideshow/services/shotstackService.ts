
/**
 * Service pour l'intégration avec l'API Shotstack
 * Permet de générer des diaporamas en utilisant soit des templates, soit des payloads complets
 */

/**
 * Récupérer la liste des templates disponibles
 */
export const getShotstackTemplates = async () => {
  console.log("🎬 Récupération de la liste des templates Shotstack");
  
  try {
    const apiKey = Deno.env.get("SHOTSTACK_API_KEY");
    if (!apiKey) {
      throw new Error("❌ Clé API Shotstack manquante dans les variables d'environnement.");
    }

    const response = await fetch('https://api.shotstack.io/v1/templates', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Statut de la réponse:", response.status);
    
    const data = await response.json();
    console.log("📝 Templates disponibles:", JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      throw new Error(`Erreur de l'API Shotstack: ${response.status} ${response.statusText} - ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des templates:", error);
    throw error;
  }
};

/**
 * Rendre un diaporama en utilisant un template Shotstack
 * @param templateId - L'identifiant du template Shotstack
 * @param mergeVariables - Les variables à fusionner avec le template
 * @param webhookUrl - L'URL du webhook à appeler une fois le rendu terminé
 */
export const renderWithShotstackTemplate = async (templateId: string, mergeVariables: any[], webhookUrl: string) => {
  console.log("🚀 Envoi du rendu à Shotstack en utilisant le template:", templateId);
  console.log("📝 Variables de fusion:", JSON.stringify(mergeVariables, null, 2));
  
  try {
    // Vérification de la clé d'API
    const apiKey = Deno.env.get("SHOTSTACK_API_KEY");
    if (!apiKey) {
      throw new Error("❌ Clé API Shotstack manquante dans les variables d'environnement.");
    }
    
    // Construction du payload exactement comme dans l'exemple fourni
    const templatePayload = {
      id: templateId,
      merge: mergeVariables,
      callback: webhookUrl
    };
    
    console.log("📝 Payload du template:", JSON.stringify(templatePayload, null, 2));
    
    // Vérification des variables obligatoires
    if (!mergeVariables || mergeVariables.length === 0) {
      throw new Error("❌ Aucune variable fournie pour le rendu du template.");
    }

    // Fait 3 tentatives d'envoi
    let attempts = 0;
    const maxAttempts = 3;
    let lastError;
    
    while (attempts < maxAttempts) {
      try {
        console.log(`✨ Tentative d'envoi #${attempts+1} à l'API Shotstack (Template)`);
        
        // Utiliser l'URL de l'API correcte pour l'environnement de production
        const response = await fetch("https://api.shotstack.io/v1/templates/render", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(templatePayload),
        });

        console.log("✅ Statut de Shotstack:", response.status);
        let responseData;
        
        try {
          responseData = await response.json();
          console.log("📝 Réponse de Shotstack:", JSON.stringify(responseData, null, 2));
        } catch (jsonError) {
          const textResponse = await response.text();
          console.error("❌ Erreur de parsing JSON, texte de réponse:", textResponse);
          throw new Error(`Erreur de parsing JSON: ${textResponse}`);
        }

        if (!response.ok) {
          // Log more detailed information about the validation error
          if (responseData?.response?.error?.details) {
            console.error("❌ Détails de l'erreur de validation:", JSON.stringify(responseData.response.error.details, null, 2));
          }
          throw new Error(`Erreur de l'API Shotstack: ${response.status} ${response.statusText} - ${JSON.stringify(responseData)}`);
        }

        const renderId = responseData?.response?.id;
        if (!renderId) {
          throw new Error("❌ Réponse invalide de Shotstack : ID de rendu manquant.");
        }
        
        console.log("✅ ID de rendu obtenu (template):", renderId);
        return renderId;
      } catch (error) {
        console.error(`❌ Erreur lors de la tentative #${attempts+1}:`, error);
        lastError = error;
        attempts++;
        
        if (attempts < maxAttempts) {
          console.log(`⏱️ Attente avant nouvelle tentative...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes entre les tentatives
        }
      }
    }
    
    // Si nous arrivons ici, toutes les tentatives ont échoué
    throw lastError || new Error("❌ Échec des tentatives d'envoi à Shotstack.");
  } catch (error) {
    console.error("❌ Erreur lors de l'appel à Shotstack (template):", error);
    throw error;
  }
};

// Conserver la fonction originale pour rétrocompatibilité
export const renderWithShotstack = async (renderPayload: any) => {
  console.log("🚀 Envoi du rendu à Shotstack.");
  try {
    // Vérification de la clé d'API
    const apiKey = Deno.env.get("SHOTSTACK_API_KEY");
    if (!apiKey) {
      throw new Error("❌ Clé API Shotstack manquante dans les variables d'environnement.");
    }
    
    console.log("📝 Payload complet à envoyer:", JSON.stringify(renderPayload, null, 2));
    
    // Vérification de structure minimale requise
    if (!renderPayload.timeline || !renderPayload.timeline.tracks || !renderPayload.output) {
      throw new Error("❌ Payload incomplet pour l'API Shotstack.");
    }

    // Vérification des clips
    if (!renderPayload.timeline.tracks[0].clips || renderPayload.timeline.tracks[0].clips.length === 0) {
      throw new Error("❌ Aucun clip trouvé dans le payload.");
    }

    // Fait 3 tentatives d'envoi
    let attempts = 0;
    const maxAttempts = 3;
    let lastError;
    
    while (attempts < maxAttempts) {
      try {
        console.log(`✨ Tentative d'envoi #${attempts+1} à l'API Shotstack`);
        
        const response = await fetch("https://api.shotstack.io/stage/render", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(renderPayload),
        });

        console.log("✅ Statut de Shotstack:", response.status);
        let responseData;
        
        try {
          responseData = await response.json();
          console.log("📝 Réponse de Shotstack:", JSON.stringify(responseData, null, 2));
        } catch (jsonError) {
          const textResponse = await response.text();
          console.error("❌ Erreur de parsing JSON, texte de réponse:", textResponse);
          throw new Error(`Erreur de parsing JSON: ${textResponse}`);
        }

        if (!response.ok) {
          // Log more detailed information about the validation error
          if (responseData?.response?.error?.details) {
            console.error("❌ Détails de l'erreur de validation:", JSON.stringify(responseData.response.error.details, null, 2));
          }
          throw new Error(`Erreur de l'API Shotstack: ${response.status} ${response.statusText} - ${JSON.stringify(responseData)}`);
        }

        const renderId = responseData?.response?.id;
        if (!renderId) {
          throw new Error("❌ Réponse invalide de Shotstack : ID de rendu manquant.");
        }
        
        console.log("✅ ID de rendu obtenu:", renderId);
        return renderId;
      } catch (error) {
        console.error(`❌ Erreur lors de la tentative #${attempts+1}:`, error);
        lastError = error;
        attempts++;
        
        if (attempts < maxAttempts) {
          console.log(`⏱️ Attente avant nouvelle tentative...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes entre les tentatives
        }
      }
    }
    
    // Si nous arrivons ici, toutes les tentatives ont échoué
    throw lastError || new Error("❌ Échec des tentatives d'envoi à Shotstack.");
  } catch (error) {
    console.error("❌ Erreur lors de l'appel à Shotstack:", error);
    throw error;
  }
};
