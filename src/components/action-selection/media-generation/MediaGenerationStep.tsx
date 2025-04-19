
import { ImageIcon } from "lucide-react";
import { SlideshowGenerationSection } from "./SlideshowGenerationSection";
import { BannerGenerationSection } from "./BannerGenerationSection";
import { PublicationType } from "../types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BannerTypeSelector } from "../../../components/banner/BannerTypeSelector";
import { Label } from "@/components/ui/label";
import { FormError } from "../../../components/banner/FormError";

type MediaGenerationStepProps = {
  selectedPublicationTypes: Array<"photo" | "slideshow" | "banner">;
  isGeneratingSlideshow: boolean;
  isGeneratingBanner: boolean;
  slideshowUrl: string | null;
  bannerUrl: string | null;
  slideshowError: string | null;
  bannerError: string | null;
  slideshowRenderId: string | null;
  formErrors: {[key: string]: string};
  generateSlideshow: () => Promise<string | null>;
  generateBanner: () => Promise<void>;
  selectedImages: string[];
  selectedMusic: string | undefined;
  refetchSlideshowStatus: () => void;
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
  setFormErrors: (errors: {[key: string]: string}) => void;
  onRegenerateSlideshow: () => void;
  onRegenerateBanner: () => void;
};

export const MediaGenerationStep = ({
  selectedPublicationTypes,
  isGeneratingSlideshow,
  isGeneratingBanner,
  slideshowUrl,
  bannerUrl,
  slideshowError,
  bannerError,
  slideshowRenderId,
  formErrors,
  generateSlideshow,
  generateBanner,
  selectedImages,
  selectedMusic,
  refetchSlideshowStatus,
  bannerImage,
  bannerType,
  setBannerType,
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
  setFormErrors,
  onRegenerateSlideshow,
  onRegenerateBanner,
  toggleImageSelection,
}: MediaGenerationStepProps) => {
  return (
    <div className="space-y-6 bg-gray-950 p-6 rounded-lg border border-gray-800">
      <h3 className="text-lg font-medium text-white">Génération des médias</h3>
      
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-6">
          {/* Banner Type Selection */}
          <div className="space-y-4 border rounded-md p-4 bg-gray-800">
            <h3 className="text-base font-medium text-white">Type de bannière</h3>
            <BannerTypeSelector
              bannerType={bannerType}
              setBannerType={setBannerType}
              error={formErrors.bannerType}
            />
          </div>
          
          {/* Main Image Selection */}
          <div className="space-y-4 border rounded-md p-4 bg-gray-800">
            <h3 className="text-base font-medium text-white">Images</h3>
            <Label className={`${formErrors.bannerImage ? "text-destructive" : "text-gray-200"} flex items-center`}>
              <ImageIcon className="h-4 w-4 mr-2 text-primary" />
              Sélectionnez les images *
            </Label>
            <ScrollArea className={`h-[220px] border rounded-lg p-2 ${formErrors.bannerImage ? "border-destructive" : "border-gray-700"}`}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
                {selectedImages && selectedImages.length > 0 ? (
                  selectedImages.map(imageUrl => (
                    <div
                      key={imageUrl}
                      className={`relative cursor-pointer border-2 ${
                        bannerImage === imageUrl ? "border-primary" : "border-transparent"
                      } rounded overflow-hidden transition-all hover:opacity-90`}
                      onClick={() => {
                        toggleImageSelection(imageUrl);
                        if (formErrors.bannerImage) {
                          const { bannerImage, ...rest } = formErrors;
                          setFormErrors(rest);
                        }
                      }}
                    >
                      <div className={`absolute inset-0 bg-primary/10 ${
                        selectedImages.includes(imageUrl) ? "opacity-100" : "opacity-0"
                      } transition-opacity`} />
                      <img
                        src={imageUrl}
                        alt="Property"
                        className="w-full h-24 object-cover"
                      />
                      <div className={`absolute bottom-0 right-0 m-1 w-5 h-5 rounded-full ${
                        selectedImages.includes(imageUrl) ? "bg-primary" : "bg-gray-600"
                      } flex items-center justify-center text-white text-xs`}>
                        {selectedImages.indexOf(imageUrl) + 1}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 flex items-center justify-center h-32 text-gray-400">
                    Aucune image disponible.
                  </div>
                )}
              </div>
            </ScrollArea>
            <FormError error={formErrors.bannerImage} />
            <div className="text-sm text-gray-400">
              * Sélectionnez la première image pour la bannière
            </div>
          </div>

          {/* Broker Information */}
          <div className="space-y-4 border rounded-md p-4 bg-gray-800">
            <h3 className="text-base font-medium text-white">Informations du vendeur</h3>
            <div className="space-y-2">
              <Label className="flex items-center">
                <span className="text-gray-200">Nom du vendeur</span>
                <input
                  type="text"
                  value={brokerName}
                  onChange={(e) => setBrokerName(e.target.value)}
                  className="ml-2 w-full text-gray-200 bg-gray-800 border border-gray-700 rounded p-2"
                />
              </Label>
              <Label className="flex items-center">
                <span className="text-gray-200">Email du vendeur</span>
                <input
                  type="email"
                  value={brokerEmail}
                  onChange={(e) => setBrokerEmail(e.target.value)}
                  className="ml-2 w-full text-gray-200 bg-gray-800 border border-gray-700 rounded p-2"
                />
              </Label>
              <Label className="flex items-center">
                <span className="text-gray-200">Téléphone du vendeur</span>
                <input
                  type="tel"
                  value={brokerPhone}
                  onChange={(e) => setBrokerPhone(e.target.value)}
                  className="ml-2 w-full text-gray-200 bg-gray-800 border border-gray-700 rounded p-2"
                />
              </Label>
              <Label className="flex items-center">
                <span className="text-gray-200">Image du vendeur</span>
                <input
                  type="url"
                  value={brokerImageUrl || ""}
                  onChange={(e) => setBrokerImageUrl(e.target.value)}
                  placeholder="URL de l'image du vendeur"
                  className="ml-2 w-full text-gray-200 bg-gray-800 border border-gray-700 rounded p-2"
                />
              </Label>
              <Label className="flex items-center">
                <span className="text-gray-200">Logo de l'agence</span>
                <input
                  type="url"
                  value={agencyLogoUrl || ""}
                  onChange={(e) => setAgencyLogoUrl(e.target.value)}
                  placeholder="URL du logo de l'agence"
                  className="ml-2 w-full text-gray-200 bg-gray-800 border border-gray-700 rounded p-2"
                />
              </Label>
            </div>
          </div>

          {/* Generation Controls */}
          <div className="space-y-4 border rounded-md p-4 bg-gray-800">
            <h3 className="text-base font-medium text-white">Contrôles de génération</h3>
            <div className="space-y-2">
              {selectedPublicationTypes.includes("slideshow") && (
                <button
                  onClick={generateSlideshow}
                  className={`w-full px-4 py-2 rounded bg-primary text-white ${isGeneratingSlideshow ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isGeneratingSlideshow}
                >
                  {isGeneratingSlideshow ? "Génération en cours..." : "Générer la slideshow"}
                </button>
              )}
              {selectedPublicationTypes.includes("banner") && (
                <button
                  onClick={generateBanner}
                  className={`w-full px-4 py-2 rounded bg-primary text-white ${isGeneratingBanner ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isGeneratingBanner || !bannerImage}
                >
                  {isGeneratingBanner ? "Génération en cours..." : "Générer la bannière"}
                </button>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
