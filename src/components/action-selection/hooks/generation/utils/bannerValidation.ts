
import { BrokerInfo } from "../services/bannerService";

export const validateBrokerInfo = (
  bannerImage: string | null,
  brokerInfo: BrokerInfo
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!bannerImage) {
    errors.push("Veuillez sélectionner une image principale pour la bannière");
  }
  
  if (!brokerInfo) {
    errors.push("Informations du courtier manquantes");
    return { isValid: false, errors };
  }
  
  if (!brokerInfo.brokerName) errors.push("nom du courtier");
  if (!brokerInfo.brokerEmail) errors.push("email du courtier");
  if (!brokerInfo.brokerPhone) errors.push("téléphone du courtier");
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
