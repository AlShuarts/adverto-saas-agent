
import { AlertCircle } from "lucide-react";

type FormErrorProps = {
  error?: string;
};

export const FormError = ({ error }: FormErrorProps) => {
  if (!error) return null;
  
  return (
    <div className="flex items-center gap-1 mt-1">
      <AlertCircle className="h-3 w-3 text-destructive" />
      <p className="text-xs text-destructive">{error}</p>
    </div>
  );
};
