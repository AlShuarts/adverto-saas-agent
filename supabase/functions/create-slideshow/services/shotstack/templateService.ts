
/**
 * Service for managing Shotstack template-related operations
 */

const API_URL = 'https://api.shotstack.io/v1';

export const renderWithShotstackTemplate = async (templateId: string, mergeVariables: any[], webhookUrl: string) => {
  console.log("🚀 Envoi du rendu à Shotstack en utilisant le template:", templateId);
  console.log("📝 Variables de fusion:", JSON.stringify(mergeVariables, null, 2));
  
  try {
    // Vérification de la clé d'API
    const apiKey = Deno.env.get("SHOTSTACK_API_KEY");
    if (!apiKey) {
      throw new Error("❌ Clé API Shotstack manquante dans les variables d'environnement.");
    }
    
    // Construction du payload
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

    // Vérifier la valeur de AUDIO_SRC
    const audioSrcVar = mergeVariables.find(v => v.find === "AUDIO_SRC");
    if (audioSrcVar && audioSrcVar.replace === "none") {
      console.log("⚠️ Audio désactivé: La valeur 'none' pour AUDIO_SRC sera gérée par Shotstack");
    }

    const response = await fetch(`${API_URL}/templates/render`, {
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
    console.error("❌ Erreur lors de l'appel à Shotstack (template):", error);
    throw error;
  }
};
