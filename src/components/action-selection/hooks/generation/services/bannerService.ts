
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type BrokerInfo = {
  brokerImageUrl: string | null;
  agencyLogoUrl: string | null;
  brokerName: string;
  brokerEmail: string;
  brokerPhone: string;
};

export const createBanner = async (
  listingId: string,
  bannerImage: string,
  bannerType: "VENDU" | "A_VENDRE",
  brokerInfo: BrokerInfo
) => {
  console.log("Début de l'appel à l'API create-sold-banner");
  
  try {
    const { data, error } = await supabase.functions.invoke("create-sold-banner", {
      body: {
        listingId: listingId,
        config: {
          bannerType: bannerType,
          mainImage: bannerImage,
          brokerName: brokerInfo.brokerName,
          brokerEmail: brokerInfo.brokerEmail,
          brokerPhone: brokerInfo.brokerPhone,
          brokerImage: brokerInfo.brokerImageUrl,
          agencyLogo: brokerInfo.agencyLogoUrl
        }
      }
    });
  
    if (error) {
      console.error("Erreur lors de l'appel à la fonction create-sold-banner:", error);
      throw error;
    }
  
    console.log("Réponse de la fonction create-sold-banner:", data);
    
    if (!data || !data.renderId) {
      console.error("Aucun ID de rendu n'a été retourné:", data);
      throw new Error("Aucun ID de rendu n'a été retourné");
    }
  
    return data.renderId;
  } catch (err) {
    console.error("Exception lors de la création de la bannière:", err);
    throw err;
  }
};

export const checkBannerStatus = async (renderId: string) => {
  console.log(`Vérification du statut pour le renderId: ${renderId}`);
  
  try {
    const { data: statusData, error: statusError } = await supabase
      .from("sold_banner_renders")
      .select("image_url, status")
      .eq("render_id", renderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
      
    if (statusError) {
      console.error("Erreur lors de la vérification du statut:", statusError);
      throw statusError;
    }
    
    console.log("Statut récupéré:", statusData);
    return statusData;
  } catch (err) {
    console.error("Exception lors de la vérification du statut:", err);
    throw err;
  }
};
