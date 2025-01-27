import { Tables } from "@/integrations/supabase/types";
import { Loader2, Instagram } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type InstagramPreviewContentProps = {
  isLoading: boolean;
  error: string | null;
  generatedText: string;
  images: string[];
  onTextChange: (text: string) => void;
};

export const InstagramPreviewContent = ({
  isLoading,
  error,
  generatedText,
  images,
  onTextChange,
}: InstagramPreviewContentProps) => {
  return (
    <div className="glass border border-border/40 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-700 rounded-full flex items-center justify-center">
          <Instagram className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Votre Compte Instagram</p>
          <p className="text-sm text-muted-foreground">Maintenant</p>
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full aspect-square object-cover rounded"
                />
              ))}
            </div>
          )}
          <Textarea
            value={generatedText}
            onChange={(e) => onTextChange(e.target.value)}
            className="min-h-[150px]"
            placeholder="Entrez votre texte ici..."
          />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </>
      )}
    </div>
  );
};