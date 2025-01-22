// Nous allons utiliser Replicate au lieu de FFmpeg
export const createSlideshow = async (images: string[], listing: any) => {
  console.log('Starting slideshow creation with Replicate...');
  
  try {
    // Nous utilisons le premier lot d'images pour créer la vidéo
    const imageUrls = images.slice(0, 4); // Limit to 4 images as per model requirements
    console.log('Processing images:', imageUrls);
    
    // Vérification de la clé API
    const apiKey = Deno.env.get("REPLICATE_API_KEY");
    if (!apiKey) {
      throw new Error("REPLICATE_API_KEY is not set");
    }
    
    // Appel à l'API Replicate avec un modèle différent
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${apiKey}`,
      },
      body: JSON.stringify({
        version: "50d6931f39e680e58a8c7bc4a32a861d5c0d263c254cc5d3387fb62d4c967b74",
        input: {
          image_sequence: imageUrls,
          fps: 1,
          transition: "fade",
          output_format: "mp4",
          width: 1920,
          height: 1080
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Replicate API error response:', error);
      throw new Error(`Replicate API error: ${error.detail || response.statusText}`);
    }

    const prediction = await response.json();
    console.log('Prediction created:', prediction);

    // Attendre que la prédiction soit terminée
    const pollInterval = 1000; // 1 seconde
    let result;
    while (!result) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Token ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!pollResponse.ok) {
        const error = await pollResponse.json();
        console.error('Error polling prediction:', error);
        throw new Error(`Polling error: ${error.detail || pollResponse.statusText}`);
      }

      const pollResult = await pollResponse.json();
      console.log('Poll result:', pollResult);

      if (pollResult.status === "succeeded") {
        result = pollResult;
        break;
      } else if (pollResult.status === "failed") {
        throw new Error(`Prediction failed: ${pollResult.error}`);
      }
      
      console.log('Waiting for prediction to complete...');
    }

    console.log('Video generation completed:', result);
    return result.output;
  } catch (error) {
    console.error('Error in createSlideshow:', error);
    throw error;
  }
};