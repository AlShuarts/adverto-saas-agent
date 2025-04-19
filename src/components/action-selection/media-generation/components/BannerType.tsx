
import { BannerTypeSelector } from "@/components/banner/BannerTypeSelector";

type BannerTypeProps = {
  bannerType: "VENDU" | "A_VENDRE";
  setBannerType: (type: "VENDU" | "A_VENDRE") => void;
  formErrors: {[key: string]: string};
};

export const BannerType = ({ bannerType, setBannerType, formErrors }: BannerTypeProps) => {
  return (
    <div className="space-y-4 border rounded-md p-4 bg-gray-800">
      <h3 className="text-base font-medium text-white">Type de bannière</h3>
      <BannerTypeSelector
        bannerType={bannerType}
        setBannerType={setBannerType}
        error={formErrors.bannerType}
      />
    </div>
  );
};
