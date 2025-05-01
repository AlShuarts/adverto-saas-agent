
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

type SlideshowImageSelectorProps = {
  images: string[];
  selectedImages: string[];
  onImageSelect: (imageUrl: string) => void;
};

export const SlideshowImageSelector = ({
  images,
  selectedImages,
  onImageSelect
}: SlideshowImageSelectorProps) => {
  const isMobile = useIsMobile();
  const scrollHeight = isMobile ? "h-[180px]" : "h-[280px]";
  
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Images disponibles</h4>
          <ScrollArea className={`${scrollHeight} border rounded-lg p-1`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1">
              {images?.map(imageUrl => (
                <div key={imageUrl} className="relative group cursor-pointer" onClick={() => onImageSelect(imageUrl)}>
                  <img src={imageUrl} alt="Property" className="w-full h-24 object-cover rounded" />
                  <div className={`absolute inset-0 flex items-center justify-center bg-black/50 ${selectedImages.includes(imageUrl) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    <Checkbox 
                      checked={selectedImages.includes(imageUrl)} 
                      onCheckedChange={() => onImageSelect(imageUrl)} 
                      className="scale-125"
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Images sélectionnées ({selectedImages.length})</h4>
          <ScrollArea className={`${scrollHeight} border rounded-lg p-1`}>
            {selectedImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1">
                {selectedImages.map(imageUrl => (
                  <div key={imageUrl} className="relative group cursor-pointer" onClick={() => onImageSelect(imageUrl)}>
                    <img src={imageUrl} alt="Selected" className="w-full h-24 object-cover rounded" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onImageSelect(imageUrl);
                        }} 
                        className="text-white text-xs bg-red-500/80 hover:bg-red-600 p-1 px-2 rounded"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground p-4">
                Aucune image sélectionnée
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </Card>
  );
};
