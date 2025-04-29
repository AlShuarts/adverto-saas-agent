
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { SlideshowPlayer } from "../SlideshowPlayer";
import { Tables } from "@/integrations/supabase/types";

type EditContentTabProps = {
  listing: Tables<"listings">;
  musicUrl: string | null;
  isLoading: boolean;
  editedText: string;
  setEditedText: (text: string) => void;
  error?: string | null;
};

export const EditContentTab = ({ 
  listing, 
  musicUrl, 
  isLoading, 
  editedText, 
  setEditedText, 
  error 
}: EditContentTabProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
    <div className="h-full flex flex-col">
      {listing.images && (
        <div className="relative bg-black rounded-lg overflow-hidden h-full">
          <SlideshowPlayer
            images={listing.images}
            musicUrl={musicUrl}
          />
        </div>
      )}
    </div>
    
    <div className="h-full flex flex-col border rounded-lg p-4">
      <h3 className="text-sm font-medium mb-2">Message de la publication</h3>
      <ScrollArea className="flex-grow">
        <div className="pr-4 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="min-h-[200px] resize-none w-full"
              placeholder="Entrez votre texte ici..."
            />
          )}
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
      </ScrollArea>
    </div>
  </div>
);
