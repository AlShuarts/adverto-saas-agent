
import { getShotstackApiKey } from './apiClient.ts';

const API_URL = 'https://api.shotstack.io/v1';

interface RenderRequest {
  timeline: any;
  output?: {
    format?: string;
    fps?: number;
    size?: {
      width: number;
      height: number;
    };
  };
  callback?: string;
}

export const renderWithShotstack = async (timeline: any, webhookUrl: string) => {
  console.log("🚀 Envoi du rendu à Shotstack");
  console.log("📝 Timeline:", JSON.stringify(timeline, null, 2));
  
  try {
    const apiKey = getShotstackApiKey();
    
    const renderPayload: RenderRequest = {
      timeline: timeline.timeline,
      output: timeline.output,
      callback: webhookUrl
    };
    
    console.log("📝 Payload de rendu:", JSON.stringify(renderPayload, null, 2));
    
    const response = await fetch(`${API_URL}/render`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json"
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
      throw new Error(`Erreur de l'API Shotstack: ${response.status} ${response.statusText} - ${JSON.stringify(responseData)}`);
    }

    const renderId = responseData?.response?.id;
    if (!renderId) {
      throw new Error("❌ Réponse invalide de Shotstack : ID de rendu manquant.");
    }
    
    console.log("✅ ID de rendu obtenu:", renderId);
    return renderId;
  } catch (error) {
    console.error("❌ Erreur lors de l'appel à Shotstack:", error);
    throw error;
  }
};

