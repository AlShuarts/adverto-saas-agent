
import { useState, useCallback, useRef, useEffect } from 'react';
import { PublicationType } from '../context/types';

export const usePublicationTypeHandler = () => {
  const [selectedPublicationTypes, setSelectedPublicationTypes] = useState<PublicationType[]>([]);
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    // Log state changes after initial mount
    if (!isInitialMount.current) {
      console.log("PublicationType handler - state updated:", selectedPublicationTypes);
    } else {
      isInitialMount.current = false;
    }
  }, [selectedPublicationTypes]);

  const handlePublicationTypeChange = useCallback((type: PublicationType, checked: boolean) => {
    console.log("Publication type change requested:", type, checked);
    
    setSelectedPublicationTypes(prev => {
      const newTypes = checked 
        ? [...prev, type].filter((v, i, a) => a.indexOf(v) === i) // Add and deduplicate
        : prev.filter(t => t !== type); // Remove
        
      console.log("Publication types state after update:", newTypes);
      return newTypes;
    });
  }, []);

  return {
    selectedPublicationTypes,
    setSelectedPublicationTypes,
    handlePublicationTypeChange,
  };
};
