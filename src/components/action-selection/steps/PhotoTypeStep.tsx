
import { PhotoType } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileImage, Images } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";

type PhotoTypeStepProps = {
  selectedPhotoType: PhotoType | null;
  onPhotoTypeChange: (type: PhotoType) => void;
  onAutoNext?: () => void;
};

export const PhotoTypeStep = ({
  selectedPhotoType,
  onPhotoTypeChange,
  onAutoNext
}: PhotoTypeStepProps) => {
  const isMobile = useIsMobile();

  // Auto-advance to next step when selection is made
  useEffect(() => {
    if (selectedPhotoType && onAutoNext) {
      const timer = setTimeout(() => {
        onAutoNext();
      }, 800); // Small delay for visual feedback
      return () => clearTimeout(timer);
    }
  }, [selectedPhotoType, onAutoNext]);

  const options = [
    {
      id: "listing_photos" as PhotoType,
      title: "Photos du bien",
      description: "Utilisez les photos de votre propriété",
      icon: Images,
      features: ["Photos haute résolution", "Mise en valeur du bien", "Publication rapide"]
    },
    {
      id: "banner" as PhotoType,
      title: "Bannière personnalisée",
      description: "Créez une bannière avec vos informations",
      icon: FileImage,
      features: ["Design professionnel", "Informations du courtier", "Format optimisé"]
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-white`}>
          Choisissez le type de photo
        </h2>
        <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-400`}>
          Sélectionnez le format qui convient le mieux à votre publication
        </p>
      </div>

      <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 gap-4"}`}>
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedPhotoType === option.id;
          
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-300 border-2 hover:scale-[1.02] ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-lg scale-[1.02]"
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
              }`}
              onClick={() => onPhotoTypeChange(option.id)}
            >
              <CardHeader className={`text-center ${isMobile ? "pb-2 pt-3" : "pb-3 pt-4"}`}>
                <div className="flex justify-center mb-2">
                  <Icon 
                    className={`${isMobile ? "w-6 h-6" : "w-8 h-8"} ${
                      isSelected ? "text-primary" : "text-gray-400"
                    }`} 
                  />
                </div>
                <CardTitle className={`${isMobile ? "text-base" : "text-lg"} text-white`}>
                  {option.title}
                </CardTitle>
                <CardDescription className={`${isMobile ? "text-xs" : "text-sm"} text-gray-400`}>
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className={`${isMobile ? "pt-0 pb-3" : "pt-1 pb-4"}`}>
                <ul className="space-y-1">
                  {option.features.map((feature, index) => (
                    <li 
                      key={index} 
                      className={`${isMobile ? "text-xs" : "text-sm"} text-gray-300 flex items-center`}
                    >
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {isSelected && (
                  <div className="mt-3">
                    <Button 
                      className={`w-full bg-primary hover:bg-primary/90 ${isMobile ? "text-xs py-1.5" : "text-sm py-2"}`}
                      disabled
                    >
                      Sélectionné ✓
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
