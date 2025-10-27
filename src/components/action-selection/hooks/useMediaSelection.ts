
import { useState } from 'react';

export const useMediaSelection = (initialImages: string[] = []) => {
  const [selectedFacebookImages, setSelectedFacebookImages] = useState<string[]>([]);
  const [selectedInstagramImages, setSelectedInstagramImages] = useState<string[]>([]);
  const [bannerType, setBannerType] = useState<"VENDU" | "A_VENDRE">("VENDU");
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  const resetMediaSelection = (defaultImage: string | null) => {
    setSelectedFacebookImages([]);
    setSelectedInstagramImages([]);
    setBannerImage(defaultImage);
    setBannerType("VENDU");
  };

  const toggleFacebookImageSelection = (imageUrl: string) => {
    setSelectedFacebookImages(prev => {
      // Limite de 50 images pour Facebook
      if (!prev.includes(imageUrl) && prev.length >= 50) {
        return prev; // Ne pas ajouter si limite atteinte
      }
      return prev.includes(imageUrl)
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl];
    });
  };

  const toggleInstagramImageSelection = (imageUrl: string) => {
    setSelectedInstagramImages(prev => {
      // Limite de 10 images pour Instagram
      if (!prev.includes(imageUrl) && prev.length >= 10) {
        return prev; // Ne pas ajouter si limite atteinte
      }
      return prev.includes(imageUrl)
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl];
    });
  };

  const selectAllFacebookImages = (availableImages: string[]) => {
    // Limiter à 50 pour Facebook
    setSelectedFacebookImages(availableImages.slice(0, 50));
  };

  const selectAllInstagramImages = (availableImages: string[]) => {
    // Limiter à 10 pour Instagram
    setSelectedInstagramImages(availableImages.slice(0, 10));
  };

  const deselectAllFacebookImages = () => {
    setSelectedFacebookImages([]);
  };

  const deselectAllInstagramImages = () => {
    setSelectedInstagramImages([]);
  };
  
  const selectBannerImage = (imageUrl: string) => {
    setBannerImage(imageUrl);
  };

  return {
    selectedFacebookImages,
    setSelectedFacebookImages,
    selectedInstagramImages,
    setSelectedInstagramImages,
    bannerType,
    setBannerType,
    bannerImage,
    setBannerImage,
    resetMediaSelection,
    toggleFacebookImageSelection,
    toggleInstagramImageSelection,
    selectAllFacebookImages,
    selectAllInstagramImages,
    deselectAllFacebookImages,
    deselectAllInstagramImages,
    selectBannerImage
  };
};
