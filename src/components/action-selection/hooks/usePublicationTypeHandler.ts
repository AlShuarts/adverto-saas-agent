
import { useState, useCallback } from 'react';
import { PublicationType } from '../context/types';

export const usePublicationTypeHandler = () => {
  const [selectedPublicationTypes, setSelectedPublicationTypes] = useState<PublicationType[]>([]);

  const handlePublicationTypeChange = useCallback((type: PublicationType, checked: boolean) => {
    console.log("Publication type changed:", type, checked);
    setSelectedPublicationTypes(prev => {
      if (checked) {
        // Add the type if it's not already in the array
        return prev.includes(type) ? prev : [...prev, type];
      } else {
        // Remove the type if it's in the array
        return prev.filter(t => t !== type);
      }
    });
  }, []);

  return {
    selectedPublicationTypes,
    setSelectedPublicationTypes,
    handlePublicationTypeChange,
  };
};
