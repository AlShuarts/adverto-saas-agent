
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
  
  if (error) throw error;
  
  if (!data || !data.renderId) {
    throw new Error("Aucun ID de rendu n'a été retourné");
  }
  
  return data.renderId;
};

export const checkBannerStatus = async (renderId: string) => {
  const { data: statusData, error: statusError } = await supabase
    .from("sold_banner_renders")
    .select("image_url, status")
    .eq("render_id", renderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
    
  if (statusError) throw statusError;
  
  return statusData;
};
