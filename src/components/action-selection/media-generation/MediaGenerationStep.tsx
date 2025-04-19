
import { ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BannerType } from "./components/BannerType";
import { ImageSelection } from "./components/ImageSelection";

type MediaGenerationStepProps = {
  isGeneratingBanner: boolean;
  bannerUrl: string | null;
  bannerError: string | null;
  generateBanner: () => Promise<void>;
  bannerImage: string | null;
  bannerType: "VENDU" | "A_VENDRE";
  setBannerType: (type: "VENDU" | "A_VENDRE") => void;
  selectBannerImage: (imageUrl: string) => void;
  brokerName: string;
  setBrokerName: (name: string) => void;
  brokerEmail: string;
  setBrokerEmail: (email: string) => void;
  brokerPhone: string;
  setBrokerPhone: (phone: string) => void;
  brokerImageUrl: string | null;
  setBrokerImageUrl: (url: string | null) => void;
  agencyLogoUrl: string | null;
  setAgencyLogoUrl: (url: string | null) => void;
  formErrors: {[key: string]: string};
  setFormErrors: (errors: {[key: string]: string}) => void;
  listing: {
    images: string[];
  };
};

export const MediaGenerationStep = ({
  bannerType,
  setBannerType,
  bannerImage,
  selectBannerImage,
  brokerName,
  setBrokerName,
  brokerEmail,
  setBrokerEmail,
  brokerPhone,
  setBrokerPhone,
  brokerImageUrl,
  setBrokerImageUrl,
  agencyLogoUrl,
  setAgencyLogoUrl,
  formErrors,
  setFormErrors,
  listing,
}: MediaGenerationStepProps) => {
  return (
    <div className="space-y-6 bg-gray-950 p-6 rounded-lg border border-gray-800">
      <h3 className="text-lg font-medium text-white">Génération des médias</h3>
      
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-6">
          {/* Banner Type Selection */}
          <BannerType
            bannerType={bannerType}
            setBannerType={setBannerType}
            formErrors={formErrors}
          />
          
          {/* Image Selection */}
          <ImageSelection
            images={listing.images || []}
            selectedImage={bannerImage}
            onSelectImage={selectBannerImage}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
          />
        </div>
      </ScrollArea>
    </div>
  );
};
