
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
  merge?: any[];
}

export const renderWithShotstack = async (timeline: any, webhookUrl: string) => {
  console.log("🚀 Envoi du rendu à Shotstack");
  
  try {
    const apiKey = getShotstackApiKey();
    
    // Vérifier que la timeline est correctement formatée
    if (!timeline || !timeline.timeline || !timeline.timeline.tracks) {
      throw new Error("Timeline incorrecte ou mal formatée");
    }
    
    // Vérifier que chaque track a des clips
    for (const track of timeline.timeline.tracks) {
      if (!track.clips || !Array.isArray(track.clips) || track.clips.length === 0) {
        console.warn("Track sans clips détecté:", track);
      }
    }
    
    // Vérifier si la timeline contient une piste audio
    const hasAudioTrack = timeline.timeline.tracks.some(track => 
      track.clips && track.clips.some(clip => clip.asset?.type === 'audio')
    );
    
    if (hasAudioTrack) {
      console.log("✅ Piste audio détectée dans la timeline");
    } else {
      console.log("⚠️ Aucune piste audio n'a été détectée dans la timeline");
    }
    
    const renderPayload: RenderRequest = {
      timeline: timeline.timeline,
      output: timeline.output,
      callback: webhookUrl
    };
    
    // Ajouter les remplacements merge si présents
    if (timeline.merge && Array.isArray(timeline.merge) && timeline.merge.length > 0) {
      renderPayload.merge = timeline.merge;
    }
    
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
