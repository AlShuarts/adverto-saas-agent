
export const renderWithShotstack = async (renderPayload: any) => {
  console.log("🚀 Début de la fonction renderWithShotstack");
  try {
    // Vérification de la présence de la clé API
    const apiKey = Deno.env.get("SHOTSTACK_API_KEY");
    if (!apiKey) {
      throw new Error("❌ Clé API Shotstack manquante dans les variables d'environnement.");
    }

    // Log complet du payload final pour debugging
    console.log("\n📝 PAYLOAD FINAL ENVOYÉ À SHOTSTACK:");
    console.log(JSON.stringify(renderPayload, null, 2));

    // Appel à l'API Shotstack avec plusieurs tentatives
    let attempts = 0;
    const maxAttempts = 3;
    let lastError;
    
    while (attempts < maxAttempts) {
      try {
        console.log(`✨ Tentative d'envoi #${attempts+1} à l'API Shotstack`);
        
        const response = await fetch("https://api.shotstack.io/v1/render", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(renderPayload),
        });

        console.log("📊 Statut de réponse Shotstack:", response.status);
        
        let responseData;
        try {
          responseData = await response.json();
        } catch (jsonError) {
          const textResponse = await response.text();
          console.error("❌ Erreur de parsing JSON, texte de réponse:", textResponse);
          throw new Error(`Erreur de parsing JSON: ${textResponse}`);
        }
        
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
    console.error("❌ ERREUR CRITIQUE lors de l'appel à Shotstack:", error);
    throw error;
  }
};
