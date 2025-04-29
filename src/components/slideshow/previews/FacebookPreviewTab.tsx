
import { SlideshowPlayer } from "../SlideshowPlayer";
import { Tables } from "@/integrations/supabase/types";

type FacebookPreviewTabProps = {
  editedText: string;
  listing: Tables<"listings">;
  musicUrl: string | null;
};

export const FacebookPreview = ({ editedText, listing, musicUrl }: FacebookPreviewTabProps) => (
  <div className="border rounded-lg p-4 bg-white shadow-sm">
    <div className="flex items-center space-x-2 border-b pb-3">
      <div className="w-10 h-10 bg-blue-600 rounded-full" />
      <div>
        <p className="font-semibold">Votre Page Facebook</p>
        <p className="text-xs text-gray-500">Maintenant</p>
      </div>
    </div>
    <div className="py-3">
      <p className="text-sm whitespace-pre-wrap mb-3">{editedText}</p>
      <div className="aspect-video bg-black rounded-md overflow-hidden">
        {listing.images && (
          <SlideshowPlayer
            images={listing.images}
            musicUrl={musicUrl}
          />
        )}
      </div>
    </div>
    <div className="flex justify-between border-t pt-3 text-sm text-gray-500">
      <span>J'aime</span>
      <span>Commenter</span>
      <span>Partager</span>
    </div>
  </div>
);

export const FacebookPreviewTab = ({ editedText, listing, musicUrl }: FacebookPreviewTabProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Aperçu Facebook</h3>
      <div className="p-2">
        <FacebookPreview editedText={editedText} listing={listing} musicUrl={musicUrl} />
      </div>
    </div>
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Diaporama</h3>
      {listing.images && (
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <SlideshowPlayer
            images={listing.images}
            musicUrl={musicUrl}
          />
        </div>
      )}
    </div>
  </div>
);
