
import { useState } from 'react';
import { SocialNetworks } from '../context/types';

export const useSocialNetworkSelection = () => {
  const [selectedNetworks, setSelectedNetworks] = useState<SocialNetworks>({
    facebook: false,
    instagram: false
  });

  const resetNetworks = () => {
    setSelectedNetworks({
      facebook: false,
      instagram: false
    });
  };

  const handleNetworkChange = (network: keyof SocialNetworks, checked: boolean) => {
    setSelectedNetworks({
      ...selectedNetworks,
      [network]: checked
    });
  };

  return {
    selectedNetworks,
    setSelectedNetworks,
    resetNetworks,
    handleNetworkChange
  };
};
