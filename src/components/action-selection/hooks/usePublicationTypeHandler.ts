
import { useState } from 'react';
import { PublicationType, PhotoType } from '../context/types';

export const usePublicationTypeHandler = () => {
  const [selectedPublicationType, setSelectedPublicationType] = useState<PublicationType | null>(null);
  const [selectedPhotoType, setSelectedPhotoType] = useState<PhotoType | null>(null);

  const handlePublicationTypeChange = (type: PublicationType) => {
    setSelectedPublicationType(type);
    // Reset photo type when changing publication type
    setSelectedPhotoType(null);
  };

  const handlePhotoTypeChange = (type: PhotoType) => {
    setSelectedPhotoType(type);
  };

  return {
    selectedPublicationType,
    selectedPhotoType,
    setSelectedPublicationType,
    setSelectedPhotoType,
    handlePublicationTypeChange,
    handlePhotoTypeChange,
  };
};
