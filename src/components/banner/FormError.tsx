
import { AlertCircle } from "lucide-react";

type FormErrorProps = {
  error?: string;
}

export const FormError = ({ error }: FormErrorProps) => {
  if (!error) return null;
  
  return (
    <div className="flex items-center text-xs text-destructive font-medium mt-1">
      <AlertCircle className="w-3 h-3 mr-1" />
      <span>{error}</span>
    </div>
  );
};
