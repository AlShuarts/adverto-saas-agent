
/**
 * Service for managing Shotstack templates
 */

import { fetchShotstackApi } from './apiClient.ts';

export const getShotstackTemplates = async () => {
  console.log("🎬 Récupération de la liste des templates Shotstack");
  
  try {
    const data = await fetchShotstackApi('/templates');
    console.log("📝 Templates disponibles:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des templates:", error);
    throw error;
  }
};

