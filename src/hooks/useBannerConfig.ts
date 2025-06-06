
import { useState, useEffect } from 'react';

export type BannerConfig = {
  brokerName: string;
  brokerEmail: string;
  brokerPhone: string;
  brokerImageUrl: string | null;
  agencyLogoUrl: string | null;
};

export const useBannerConfig = () => {
  const [config, setConfig] = useState<BannerConfig | null>(null);

  const loadConfig = () => {
    try {
      const savedConfig = localStorage.getItem('bannerConfig');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        return parsed;
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la configuration bannière:", error);
    }
    return null;
  };

  const saveConfig = (newConfig: BannerConfig) => {
    try {
      localStorage.setItem('bannerConfig', JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la configuration bannière:", error);
    }
  };

  const clearConfig = () => {
    try {
      localStorage.removeItem('bannerConfig');
      setConfig(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de la configuration bannière:", error);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    loadConfig,
    saveConfig,
    clearConfig
  };
};
