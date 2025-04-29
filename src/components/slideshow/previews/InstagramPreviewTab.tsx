
import { Instagram } from "lucide-react";
import { SlideshowPlayer } from "../SlideshowPlayer";
import { Tables } from "@/integrations/supabase/types";

type InstagramPreviewTabProps = {
  editedText: string;
  listing: Tables<"listings">;
  musicUrl: string | null;
};

export const InstagramPreview = ({ editedText, listing, musicUrl }: InstagramPreviewTabProps) => (
  <div className="border rounded-lg p-4 bg-white shadow-sm">
    <div className="flex items-center space-x-2 border-b pb-3">
      <div className="w-10 h-10 bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-700 rounded-full flex items-center justify-center">
        <Instagram className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-semibold">Votre Compte Instagram</p>
        <p className="text-xs text-gray-500">Maintenant</p>
      </div>
    </div>
    <div className="py-3">
      {listing.images && (
        <div className="aspect-square bg-black rounded-md overflow-hidden mb-3">
          <SlideshowPlayer
            images={listing.images}
            musicUrl={musicUrl}
          />
        </div>
      )}
      <div className="flex space-x-4 py-2">
        <div className="flex space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
      </div>
      <p className="font-semibold text-sm mt-1">0 J'aime</p>
      <div className="mt-1">
        <span className="font-semibold text-sm">Votre Compte</span>{" "}
        <span className="text-sm whitespace-pre-wrap">{editedText}</span>
      </div>
    </div>
  </div>
);

export const InstagramPreviewTab = ({ editedText, listing, musicUrl }: InstagramPreviewTabProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Aperçu Instagram</h3>
      <div className="p-2">
        <InstagramPreview editedText={editedText} listing={listing} musicUrl={musicUrl} />
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
