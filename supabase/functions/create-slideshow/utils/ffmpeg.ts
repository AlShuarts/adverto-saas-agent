// Nous allons utiliser Replicate au lieu de FFmpeg
export const createSlideshow = async (images: string[], listing: any) => {
  console.log('Starting slideshow creation with Replicate...');
  
  try {
    // Nous utilisons le premier lot d'images pour créer la vidéo
    const imageUrls = images.slice(0, 4); // Limit to 4 images as per model requirements
    console.log('Processing images:', imageUrls);
    
    // Appel à l'API Replicate
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${Deno.env.get("REPLICATE_API_KEY")}`,
      },
      body: JSON.stringify({
        version: "2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3787b6ee",
        input: {
          image_sequence: imageUrls,
          fps: 1,
          transition: "fade",
          transition_duration: 1
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Replicate API error response:', error);
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
      
      if (!pollResponse.ok) {
        const error = await pollResponse.json();
        console.error('Error polling prediction:', error);
        throw new Error(`Polling error: ${pollResponse.statusText}`);
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