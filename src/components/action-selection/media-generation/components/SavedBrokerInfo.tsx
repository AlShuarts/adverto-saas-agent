
import { BannerConfig } from "@/hooks/useBannerConfig";

type SavedBrokerInfoProps = {
  config: BannerConfig | null;
};

export const SavedBrokerInfo = ({ config }: SavedBrokerInfoProps) => {
  if (!config) return null;

  return (
    <div className="space-y-2 border rounded-md p-4 bg-muted/30">
      <h3 className="text-base font-medium">Informations du courtier (sauvegardées)</h3>
      <div className="text-sm text-muted-foreground space-y-1">
        <p><strong>Nom:</strong> {config.brokerName}</p>
        <p><strong>Email:</strong> {config.brokerEmail}</p>
        <p><strong>Téléphone:</strong> {config.brokerPhone}</p>
        {config.brokerImageUrl && <p><strong>Photo du courtier:</strong> Configurée</p>}
        {config.agencyLogoUrl && <p><strong>Logo de l'agence:</strong> Configuré</p>}
      </div>
    </div>
  );
};
