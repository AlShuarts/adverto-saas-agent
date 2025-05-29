
import { useState } from 'react';

export const useMediaSelection = (initialImages: string[] = []) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [bannerType, setBannerType] = useState<"VENDU" | "A_VENDRE">("VENDU");
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  const resetMediaSelection = (defaultImage: string | null) => {
    setSelectedImages([]);
    setBannerImage(defaultImage);
    setBannerType("VENDU");
  };

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => 
      prev.includes(imageUrl)
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  const selectAllImages = (availableImages: string[]) => {
    setSelectedImages(availableImages);
  };

  const deselectAllImages = () => {
    setSelectedImages([]);
  };
  
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(selectedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSelectedImages(items);
  };
  
  const selectBannerImage = (imageUrl: string) => {
    setBannerImage(imageUrl);
  };

  return {
    selectedImages,
    setSelectedImages,
    bannerType,
    setBannerType,
    bannerImage,
    setBannerImage,
    resetMediaSelection,
    toggleImageSelection,
    selectAllImages,
    deselectAllImages,
    onDragEnd,
    selectBannerImage
  };
};
