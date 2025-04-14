
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
      throw new Error("❌ Réponse invalide de Shotstack.");
    }
    
    console.log("✅ ID de rendu obtenu:", renderId);
    return renderId;
  } catch (error) {
    console.error("❌ Erreur lors de l'appel à Shotstack:", error);
    throw error;
  }
};
