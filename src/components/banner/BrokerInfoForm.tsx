
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { FormError } from "./FormError";
import { Mail, Phone, User, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type BrokerInfoFormProps = {
  brokerName: string;
  setBrokerName: (name: string) => void;
  brokerEmail: string;
  setBrokerEmail: (email: string) => void;
  brokerPhone: string;
  setBrokerPhone: (phone: string) => void;
  formErrors: {[key: string]: string};
  setFormErrors: (errors: {[key: string]: string}) => void;
};

export const BrokerInfoForm = ({ 
  brokerName, 
  setBrokerName, 
  brokerEmail, 
  setBrokerEmail, 
  brokerPhone, 
  setBrokerPhone,
  formErrors,
  setFormErrors 
}: BrokerInfoFormProps) => {
  
  // Fetch email from Supabase Auth when component mounts
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user?.email && brokerEmail === "") {
          setBrokerEmail(data.session.user.email);
        }
      } catch (error) {
        console.error("Error fetching user email:", error);
      }
    };
    
    fetchEmail();
  }, [setBrokerEmail, brokerEmail]);

  const hasAllRequiredFields = brokerName && brokerEmail && brokerPhone;

  return (
    <div className="space-y-4">
      {!hasAllRequiredFields && (
        <Alert variant="default" className="bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            Tous les champs marqués d'un astérisque (*) sont obligatoires pour générer la bannière
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Informations obligatoires</span>
        <span className="text-xs text-muted-foreground">* = Champ obligatoire</span>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="brokerName" className={`flex items-center ${formErrors.brokerName ? "text-destructive" : ""}`}>
          <User className="h-4 w-4 mr-2 text-muted-foreground" />
          Nom du courtier *
        </Label>
        <Input
          id="brokerName"
          value={brokerName}
          onChange={(e) => {
            setBrokerName(e.target.value);
            if (formErrors.brokerName) {
              const { brokerName, ...rest } = formErrors;
              setFormErrors(rest);
            }
          }}
          placeholder="Entrez le nom du courtier"
          className={`${formErrors.brokerName ? "border-destructive" : ""} ${!brokerName ? "border-amber-300 bg-amber-50" : ""}`}
        />
        {!brokerName && !formErrors.brokerName && (
          <div className="flex items-center text-xs text-amber-600 mt-1">
            <AlertCircle className="h-3 w-3 mr-1" />
            Ce champ est obligatoire
          </div>
        )}
        <FormError error={formErrors.brokerName} />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="brokerEmail" className={`flex items-center ${formErrors.brokerEmail ? "text-destructive" : ""}`}>
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          Email du courtier *
        </Label>
        <Input
          id="brokerEmail"
          type="email"
          value={brokerEmail}
          onChange={(e) => {
            setBrokerEmail(e.target.value);
            if (formErrors.brokerEmail) {
              const { brokerEmail, ...rest } = formErrors;
              setFormErrors(rest);
            }
          }}
          placeholder="Entrez l'email du courtier"
          className={`${formErrors.brokerEmail ? "border-destructive" : ""} ${!brokerEmail ? "border-amber-300 bg-amber-50" : ""}`}
        />
        {!brokerEmail && !formErrors.brokerEmail && (
          <div className="flex items-center text-xs text-amber-600 mt-1">
            <AlertCircle className="h-3 w-3 mr-1" />
            Ce champ est obligatoire
          </div>
        )}
        <FormError error={formErrors.brokerEmail} />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="brokerPhone" className={`flex items-center ${formErrors.brokerPhone ? "text-destructive" : ""}`}>
          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
          Téléphone du courtier *
        </Label>
        <Input
          id="brokerPhone"
          type="tel"
          value={brokerPhone}
          onChange={(e) => {
            setBrokerPhone(e.target.value);
            if (formErrors.brokerPhone) {
              const { brokerPhone, ...rest } = formErrors;
              setFormErrors(rest);
            }
          }}
          placeholder="Entrez le téléphone du courtier"
          className={`${formErrors.brokerPhone ? "border-destructive" : ""} ${!brokerPhone ? "border-amber-300 bg-amber-50" : ""}`}
        />
        {!brokerPhone && !formErrors.brokerPhone && (
          <div className="flex items-center text-xs text-amber-600 mt-1">
            <AlertCircle className="h-3 w-3 mr-1" />
            Ce champ est obligatoire
          </div>
        )}
        <FormError error={formErrors.brokerPhone} />
      </div>
    </div>
  );
};
