import { Tables } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";

type FacebookPreviewContentProps = {
  isLoading: boolean;
  error: string | null;
  generatedText: string;
  images: string[];
};

export const FacebookPreviewContent = ({
  isLoading,
  error,
  generatedText,
  images,
}: FacebookPreviewContentProps) => {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full" />
        <div>
          <p className="font-semibold text-gray-900">Votre Page Facebook</p>
          <p className="text-sm text-gray-500">Maintenant</p>
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          <p className="whitespace-pre-line mb-4 text-gray-900">{generatedText}</p>
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-48 object-cover rounded"
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};