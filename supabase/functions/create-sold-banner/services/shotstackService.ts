
export const renderWithShotstack = async (renderPayload: any) => {
  console.log("🚀 Début de la fonction renderWithShotstack");
  try {
    // Vérification de la présence de la clé API
    const apiKey = Deno.env.get("SHOTSTACK_API_KEY");
    if (!apiKey) {
      throw new Error("❌ Clé API Shotstack manquante dans les variables d'environnement.");
    }

    // Simplification extrême du payload pour éviter les erreurs de validation
    const simplifiedPayload = {
      timeline: {
        background: "#000000",
        tracks: [
          {
            clips: renderPayload.timeline.tracks[0].clips.map((clip: any) => {
              // Crée une copie propre de chaque clip
              return JSON.parse(JSON.stringify(clip));
            })
          }
        ]
      },
      output: {
        format: "png",
        resolution: "hd"
      },
      callback: renderPayload.callback
    };

    // Log complet du payload final pour debugging
    console.log("📝 PAYLOAD FINAL ENVOYÉ À SHOTSTACK:", JSON.stringify(simplifiedPayload, null, 2));

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
