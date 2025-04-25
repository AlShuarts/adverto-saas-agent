
/**
 * Client API for Shotstack interactions
 */

const API_URL = 'https://api.shotstack.io/v1';

export const getShotstackApiKey = () => {
  const apiKey = Deno.env.get("SHOTSTACK_API_KEY");
  if (!apiKey) {
    throw new Error("❌ Clé API Shotstack manquante dans les variables d'environnement.");
  }
  return apiKey;
};

export const fetchShotstackApi = async (endpoint: string, options: RequestInit = {}) => {
  const apiKey = getShotstackApiKey();
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...options.headers,
    },
  });

  let responseData;
  try {
    responseData = await response.json();
  } catch (error) {
    const textResponse = await response.text();
    throw new Error(`Erreur de parsing JSON: ${textResponse}`);
  }

  if (!response.ok) {
    throw new Error(`Erreur de l'API Shotstack: ${response.status} ${response.statusText} - ${JSON.stringify(responseData)}`);
  }

  return responseData;
};

