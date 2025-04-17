
import { Loader2 } from "lucide-react";

type LoadingBannerProps = {
  message?: string;
};

export const LoadingBanner = ({ message = "Chargement des bannières..." }: LoadingBannerProps) => {
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      <span>{message}</span>
    </div>
  );
};
