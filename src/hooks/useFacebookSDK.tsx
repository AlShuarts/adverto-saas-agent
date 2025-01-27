import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useFacebookSDK = () => {
  const { toast } = useToast();
  const [fbInitialized, setFbInitialized] = useState(false);

  useEffect(() => {
    loadFacebookSDK();
  }, []);

  const loadFacebookSDK = async () => {
    try {
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/fr_FR/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);

      await new Promise<void>((resolve, reject) => {
        script.onload = () => {
          const checkFB = setInterval(() => {
            if (window.FB) {
              clearInterval(checkFB);
              try {
                window.FB.init({
                  appId: '3819439438267773',
                  version: 'v18.0',
                  cookie: true,
                  xfbml: true
                });
                setFbInitialized(true);
                console.log('Facebook SDK initialized successfully');
                resolve();
              } catch (initError) {
                console.error('Error during FB.init:', initError);
                reject(initError);
              }
            }
          }, 100);

          setTimeout(() => {
            clearInterval(checkFB);
            reject(new Error('Facebook SDK initialization timed out'));
          }, 10000);
        };

        script.onerror = () => reject(new Error('Failed to load Facebook SDK script'));
      });

    } catch (error) {
      console.error('Error initializing Facebook SDK:', error);
      if (error.message !== "Failed to call url") {
        toast({
          title: "Avertissement",
          description: "L'initialisation de Facebook pourrait être bloquée par votre navigateur. La connexion pourrait ne pas fonctionner correctement.",
          variant: "destructive",
        });
      }
    }
  };

  return { fbInitialized };
};