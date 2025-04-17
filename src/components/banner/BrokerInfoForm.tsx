
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { FormError } from "./FormError";
import { Mail, Phone, User } from "lucide-react";

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

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="brokerName" className={formErrors.brokerName ? "text-destructive flex items-center" : "flex items-center"}>
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
          className={formErrors.brokerName ? "border-destructive" : ""}
        />
        <FormError error={formErrors.brokerName} />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="brokerEmail" className={formErrors.brokerEmail ? "text-destructive flex items-center" : "flex items-center"}>
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
          className={formErrors.brokerEmail ? "border-destructive" : ""}
        />
        <FormError error={formErrors.brokerEmail} />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="brokerPhone" className={formErrors.brokerPhone ? "text-destructive flex items-center" : "flex items-center"}>
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
          className={formErrors.brokerPhone ? "border-destructive" : ""}
        />
        <FormError error={formErrors.brokerPhone} />
      </div>
    </div>
  );
};
