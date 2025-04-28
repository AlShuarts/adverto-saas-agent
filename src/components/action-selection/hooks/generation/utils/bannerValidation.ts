
import { BrokerInfo } from "../services/bannerService";

export const validateBrokerInfo = (
  bannerImage: string | null,
  brokerInfo: BrokerInfo
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  if (!bannerImage) {
    errors["bannerImage"] = "Veuillez sélectionner une image principale pour la bannière";
  }
  
  if (!brokerInfo) {
    errors["brokerInfo"] = "Informations du courtier manquantes";
    return { isValid: false, errors };
  }
  
  if (!brokerInfo.brokerName) errors["brokerName"] = "Le nom du courtier est requis";
  if (!brokerInfo.brokerEmail) errors["brokerEmail"] = "L'email du courtier est requis";
  if (!brokerInfo.brokerPhone) errors["brokerPhone"] = "Le téléphone du courtier est requis";
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
