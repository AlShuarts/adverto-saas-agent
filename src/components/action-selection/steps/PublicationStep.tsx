
import { PublicationType } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, FileImage } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type PublicationStepProps = {
  selectedPublicationType: PublicationType | null;
  onPublicationTypeChange: (type: PublicationType) => void;
};

export const PublicationStep = ({
  selectedPublicationType,
  onPublicationTypeChange
}: PublicationStepProps) => {
  const isMobile = useIsMobile();

  const options = [
    {
      id: "slideshow" as PublicationType,
      title: "Diaporama vidéo",
      description: "Créez une vidéo avec vos photos et de la musique",
      icon: Video,
      features: ["Animation automatique", "Musique de fond", "Format optimisé pour les réseaux"]
    },
    {
      id: "banner" as PublicationType,
      title: "Bannière statique",
      description: "Générez une bannière professionnelle",
      icon: FileImage,
      features: ["Design personnalisé", "Informations du courtier", "Format haute qualité"]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-white`}>
          Choisissez le type de publication
        </h2>
        <p className={`${isMobile ? "text-sm" : "text-base"} text-gray-400`}>
          Sélectionnez le format qui convient le mieux à votre stratégie de marketing
        </p>
      </div>

      <div className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-2 gap-6"}`}>
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedPublicationType === option.id;
          
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 border-2 hover:scale-105 ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-lg"
                  : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
              }`}
              onClick={() => onPublicationTypeChange(option.id)}
            >
              <CardHeader className={`text-center ${isMobile ? "pb-3" : "pb-4"}`}>
                <div className="flex justify-center mb-3">
                  <Icon 
                    className={`${isMobile ? "w-8 h-8" : "w-12 h-12"} ${
                      isSelected ? "text-primary" : "text-gray-400"
                    }`} 
                  />
                </div>
                <CardTitle className={`${isMobile ? "text-lg" : "text-xl"} text-white`}>
                  {option.title}
                </CardTitle>
                <CardDescription className={`${isMobile ? "text-sm" : "text-base"} text-gray-400`}>
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className={isMobile ? "pt-0" : "pt-2"}>
                <ul className="space-y-2">
                  {option.features.map((feature, index) => (
                    <li 
                      key={index} 
                      className={`${isMobile ? "text-sm" : "text-base"} text-gray-300 flex items-center`}
                    >
                      <span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {isSelected && (
                  <div className="mt-4">
                    <Button 
                      className={`w-full bg-primary hover:bg-primary/90 ${isMobile ? "text-sm py-2" : "text-base py-3"}`}
                      onClick={() => onPublicationTypeChange(option.id)}
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
