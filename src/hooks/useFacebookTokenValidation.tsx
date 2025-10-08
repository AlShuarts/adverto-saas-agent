import { useToast } from "@/hooks/use-toast";

export const useFacebookTokenValidation = () => {
  const { toast } = useToast();

  const validateFacebookToken = async (token: string, pageId: string): Promise<boolean> => {
    try {
      console.log("Validation du token Facebook...");
      
      // Nettoyer le token avant utilisation
      const cleanToken = token.trim();
      
      // Vérifier que le token a un format valide
      if (!cleanToken || cleanToken.length < 10 || cleanToken === 'null' || cleanToken === 'undefined') {
        console.error("Token invalide détecté:", { tokenLength: cleanToken.length, tokenValue: cleanToken.substring(0, 10) });
        toast({
          title: "Token invalide",
          description: "Votre token Facebook n'est pas valide. Veuillez vous reconnecter à votre page Facebook.",
          variant: "destructive",
        });
        return false;
      }
      
      // Vérifier que le token fonctionne
      const response = await fetch(
        `https://graph.facebook.com/v23.0/${pageId}?access_token=${encodeURIComponent(cleanToken)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Token invalide:", errorData);
        
        if (errorData.error?.code === 190) {
          toast({
            title: "Token expiré",
            description: "Votre token Facebook a expiré. Veuillez vous reconnecter à votre page Facebook.",
            variant: "destructive",
          });
        }
        
        return false;
      }

      const data = await response.json();
      console.log("Token validé avec succès pour:", data.name);
      return true;
    } catch (error) {
      console.error("Erreur lors de la validation du token:", error);
      toast({
        title: "Erreur de validation",
        description: "Impossible de valider votre token Facebook. Veuillez vous reconnecter.",
        variant: "destructive",
      });
      return false;
    }
  };

  const validateInstagramToken = async (token: string, instagramUserId: string): Promise<boolean> => {
    try {
      console.log("Validation du token Instagram...");
      
      const response = await fetch(
        `https://graph.facebook.com/v23.0/${instagramUserId}?access_token=${encodeURIComponent(token.trim())}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Token Instagram invalide:", errorData);
        
        if (errorData.error?.code === 190) {
          toast({
            title: "Token expiré",
            description: "Votre token Instagram a expiré. Veuillez vous reconnecter à votre compte Instagram.",
            variant: "destructive",
          });
        }
        
        return false;
      }

      const data = await response.json();
      console.log("Token Instagram validé avec succès pour:", data.username);
      return true;
    } catch (error) {
      console.error("Erreur lors de la validation du token Instagram:", error);
      toast({
        title: "Erreur de validation",
        description: "Impossible de valider votre token Instagram. Veuillez vous reconnecter.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    validateFacebookToken,
    validateInstagramToken
  };
};