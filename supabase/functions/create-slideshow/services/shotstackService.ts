
export const renderWithShotstack = async (renderPayload: any) => {
  console.log("🚀 Envoi du rendu à Shotstack.");
  try {
    const response = await fetch("https://api.shotstack.io/v1/render", {
      method: "POST",
      headers: {
        "x-api-key": Deno.env.get("SHOTSTACK_API_KEY") ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(renderPayload),
    });

    console.log("✅ Statut de Shotstack:", response.status);
    const responseData = await response.json();
    console.log("📝 Réponse de Shotstack:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      // Log more detailed information about the validation error
      if (responseData.response?.error?.details) {
        console.error("❌ Détails de l'erreur de validation:", JSON.stringify(responseData.response.error.details, null, 2));
      }
      throw new Error(`Erreur de l'API Shotstack: ${response.status} ${response.statusText} - ${JSON.stringify(responseData)}`);
    }

    const renderId = responseData.response?.id;
    if (!renderId) {
      throw new Error("❌ Réponse invalide de Shotstack.");
    }
    
    return renderId;
  } catch (error) {
    console.error("❌ Erreur lors de l'appel à Shotstack:", error);
    throw error;
  }
};
