
export const renderWithShotstack = async (renderPayload: any) => {
  console.log("🚀 Envoi du rendu à Shotstack.");
  try {
    // Vérification de la présence de la clé API
    const apiKey = Deno.env.get("SHOTSTACK_API_KEY");
    if (!apiKey) {
      throw new Error("❌ Clé API Shotstack manquante dans les variables d'environnement.");
    }

    // Simplification du payload pour éviter les erreurs de validation
    const simplifiedPayload = {
      timeline: {
        background: "#000000",
        tracks: renderPayload.timeline.tracks
      },
      output: {
        format: "png",
        resolution: "hd"
      },
      callback: renderPayload.callback
    };

    // Log complet du payload pour debugging
    console.log("📝 Payload simplifié:", JSON.stringify(simplifiedPayload, null, 2));

    const response = await fetch("https://api.shotstack.io/v1/render", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(simplifiedPayload),
    });

    console.log("✅ Statut de Shotstack:", response.status);
    const responseData = await response.json();
    console.log("📝 Réponse de Shotstack:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      // Log plus détaillé de l'erreur
      console.error("❌ Détails de l'erreur:", JSON.stringify(responseData, null, 2));
      throw new Error(`Erreur de l'API Shotstack: ${response.status} ${response.statusText} - ${JSON.stringify(responseData)}`);
    }

    const renderId = responseData.response?.id;
    if (!renderId) {
      throw new Error("❌ Réponse invalide de Shotstack: ID de rendu manquant");
    }
    
    return renderId;
  } catch (error) {
    console.error("❌ Erreur lors de l'appel à Shotstack:", error);
    throw error;
  }
};
