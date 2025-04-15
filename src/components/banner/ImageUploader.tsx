
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ImageUploaderProps = {
  type: "broker" | "agency";
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
};

export const ImageUploader = ({ type, imageUrl, setImageUrl }: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('listings-images')
        .upload(fileName, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('listings-images')
        .getPublicUrl(fileName);
        
      setImageUrl(publicUrl);
      
      toast.success(`Image ${type === "broker" ? "du courtier" : "du logo"} téléchargée avec succès`);
    } catch (error: any) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error(`Erreur lors du téléchargement de l'image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };
  
  const label = type === "broker" ? "Photo du courtier" : "Logo de l'agence";
  const inputId = type === "broker" ? "brokerImageInput" : "agencyLogoInput";
  
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => document.getElementById(inputId)?.click()}
          disabled={isUploading}
          type="button"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Télécharger
        </Button>
        <Input
          id={inputId}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
      {imageUrl && (
        <div className={
          type === "broker" 
            ? "w-20 h-20 rounded-full overflow-hidden mt-2" 
            : "w-24 h-12 overflow-hidden mt-2"
        }>
          <img
            src={imageUrl}
            alt={type === "broker" ? "Photo du courtier" : "Logo de l'agence"}
            className={
              type === "broker" 
                ? "w-full h-full object-cover" 
                : "w-full h-full object-contain"
            }
          />
        </div>
      )}
    </div>
  );
};
