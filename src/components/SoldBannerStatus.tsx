
import { Tables } from "@/integrations/supabase/types";
import { useBannerStatus } from "@/hooks/useBannerStatus";
import { useFacebookPublish } from "@/hooks/useFacebookPublish";
import { LoadingBanner } from "@/components/banner/LoadingBanner";
import { PendingBanner } from "@/components/banner/PendingBanner";
import { BannerActions } from "@/components/banner/BannerActions";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

type SoldBannerStatusProps = {
  listing: Tables<"listings">;
};

export const SoldBannerStatus = ({ listing }: SoldBannerStatusProps) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const queryClient = useQueryClient();
  const { publishToFacebook } = useFacebookPublish(listing);
  
  const {
    renders,
    isLoading,
    isRefreshing,
    hasError,
    errorMessage,
    checkRenderStatus
  } = useBannerStatus(listing.id);

  const handleFacebookShare = async (imageUrl: string, bannerType: string) => {
    try {
      setIsPublishing(true);
      const propertyType = listing.property_type ? `${listing.property_type} ` : '';
      const message = bannerType === 'VENDU' 
        ? `🎉 ${propertyType}${bannerType} 🎉\n\n${listing.address || 'Propriété'}` 
        : `🏠 ${propertyType}À VENDRE 🏠\n\n${listing.address || 'Propriété'}\n\n${listing.bedrooms || ''} ch. | ${listing.bathrooms || ''} sdb. | ${listing.price ? new Intl.NumberFormat('fr-CA', {
            style: 'currency',
            currency: 'CAD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(listing.price) : ''}`;
      
      const result = await publishToFacebook(imageUrl, message);
      if (result) {
        toast.success("Bannière publiée sur Facebook avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de la publication sur Facebook:", error);
      toast.error("Erreur lors de la publication sur Facebook");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleInstagramShare = async (imageUrl: string, bannerType: string) => {
    try {
      setIsPublishing(true);
      const propertyType = listing.property_type ? `${listing.property_type} ` : '';
      const message = bannerType === 'VENDU' 
        ? `🎉 ${propertyType}${bannerType} 🎉\n\n${listing.address || 'Propriété'}` 
        : `🏠 ${propertyType}À VENDRE 🏠\n\n${listing.address || 'Propriété'}\n\n${listing.bedrooms || ''} ch. | ${listing.bathrooms || ''} sdb. | ${listing.price ? new Intl.NumberFormat('fr-CA', {
            style: 'currency',
            currency: 'CAD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(listing.price) : ''}`;
      
      await ensureAndIncrementStatistic('instagram');
      
      // Include Authorization header for Edge function auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        return;
      }
      
      const { error } = await supabase.functions.invoke('instagram-publish', {
        body: {
          message,
          images: [imageUrl],
          listingId: listing.id
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        throw error;
      }
      
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success("Bannière publiée sur Instagram avec succès !");
    } catch (error) {
      console.error("Erreur lors de la publication sur Instagram:", error);
      toast.error("Erreur lors de la publication sur Instagram");
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return <LoadingBanner />;
  }

  if (renders.length === 0) {
    return null;
  }

  const latestRender = renders[0];
  const bannerType = latestRender.banner_type === 'VENDU' ? 'VENDU' : 'À VENDRE';

  if (latestRender.status === "pending") {
    return (
      <PendingBanner 
        bannerType={bannerType}
        isRefreshing={isRefreshing}
        hasError={hasError}
        errorMessage={errorMessage}
        onCheckStatus={() => checkRenderStatus(latestRender.render_id)}
      />
    );
  }

  if (latestRender.status === "completed" && latestRender.image_url) {
    return (
      <BannerActions 
        imageUrl={latestRender.image_url}
        bannerType={bannerType}
        onFacebookShare={handleFacebookShare}
        onInstagramShare={handleInstagramShare}
        isPublishing={isPublishing}
      />
    );
  }

  return null;
};
