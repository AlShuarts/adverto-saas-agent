
import { useState } from 'react';

export type BrokerInfoState = {
  brokerName: string;
  brokerEmail: string;
  brokerPhone: string;
  brokerImageUrl: string | null;
  agencyLogoUrl: string | null;
  formErrors: {[key: string]: string};
};

export const useBrokerInfo = () => {
  const [brokerImageUrl, setBrokerImageUrl] = useState<string | null>(null);
  const [agencyLogoUrl, setAgencyLogoUrl] = useState<string | null>(null);
  const [brokerName, setBrokerName] = useState<string>("");
  const [brokerEmail, setBrokerEmail] = useState<string>("");
  const [brokerPhone, setBrokerPhone] = useState<string>("");
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const resetBrokerInfo = () => {
    setBrokerImageUrl(null);
    setAgencyLogoUrl(null);
    setBrokerName("");
    setBrokerEmail("");
    setBrokerPhone("");
    setFormErrors({});
  };

  const validateBrokerInfo = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!brokerName || brokerName.trim() === '') {
      errors.brokerName = "Le nom du courtier est requis";
    }
    
    if (!brokerEmail || brokerEmail.trim() === '') {
      errors.brokerEmail = "L'email du courtier est requis";
    } else if (!/\S+@\S+\.\S+/.test(brokerEmail)) {
      errors.brokerEmail = "L'email semble invalide";
    }
    
    if (!brokerPhone || brokerPhone.trim() === '') {
      errors.brokerPhone = "Le téléphone du courtier est requis";
    }
    
    return errors;
  };

  return {
    brokerImageUrl,
    setBrokerImageUrl,
    agencyLogoUrl,
    setAgencyLogoUrl,
    brokerName,
    setBrokerName,
    brokerEmail,
    setBrokerEmail,
    brokerPhone,
    setBrokerPhone,
    formErrors,
    setFormErrors,
    resetBrokerInfo,
    validateBrokerInfo
  };
};
