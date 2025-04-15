
type FormErrorProps = {
  error?: string;
};

export const FormError = ({ error }: FormErrorProps) => {
  if (!error) return null;
  
  return (
    <p className="text-xs text-destructive">{error}</p>
  );
};
