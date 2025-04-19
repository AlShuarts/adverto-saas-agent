
import { useState } from 'react';
import { PublicationType } from '../context/types';

export const usePublicationTypeHandler = () => {
  const [selectedPublicationTypes, setSelectedPublicationTypes] = useState<PublicationType[]>([]);

  const handlePublicationTypeChange = (type: PublicationType, checked: boolean) => {
    setSelectedPublicationTypes(prev => 
      checked 
        ? [...prev, type] 
        : prev.filter(t => t !== type)
    );
  };

  return {
    selectedPublicationTypes,
    setSelectedPublicationTypes,
    handlePublicationTypeChange,
  };
};
