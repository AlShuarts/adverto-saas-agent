// Nous allons utiliser Replicate au lieu de FFmpeg
export const createSlideshow = async (images: string[], listing: any) => {
  console.log('Starting slideshow creation with Replicate...');
  
  try {
    // Nous utilisons seulement la première image pour l'instant
    const imageUrl = images[0];
    console.log('Processing image:', imageUrl);
    
    // Appel à l'API Replicate
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${Deno.env.get("REPLICATE_API_KEY")}`,
      },
      body: JSON.stringify({
        version: "c24011d8e77b8a51f1661f66f057a2906e7a2e9f9d63d3bb468a350193f8fd3c",
        input: {
          image: imageUrl,
          num_frames: 30,
          fps: 10,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
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
            Authorization: `Token ${Deno.env.get("REPLICATE_API_KEY")}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      const pollResult = await pollResponse.json();
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