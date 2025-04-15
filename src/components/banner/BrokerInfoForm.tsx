
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

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
        <Label htmlFor="brokerName" className={formErrors.brokerName ? "text-destructive" : ""}>
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
          placeholder="Nom du courtier"
          className={formErrors.brokerName ? "border-destructive" : ""}
        />
        {formErrors.brokerName && (
          <p className="text-xs text-destructive">{formErrors.brokerName}</p>
        )}
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="brokerEmail" className={formErrors.brokerEmail ? "text-destructive" : ""}>
          Email du courtier *
        </Label>
        <Input
          id="brokerEmail"
          value={brokerEmail}
          onChange={(e) => {
            setBrokerEmail(e.target.value);
            if (formErrors.brokerEmail) {
              const { brokerEmail, ...rest } = formErrors;
              setFormErrors(rest);
            }
          }}
          placeholder="Email du courtier"
          className={formErrors.brokerEmail ? "border-destructive" : ""}
        />
        {formErrors.brokerEmail && (
          <p className="text-xs text-destructive">{formErrors.brokerEmail}</p>
        )}
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="brokerPhone" className={formErrors.brokerPhone ? "text-destructive" : ""}>
          Téléphone du courtier *
        </Label>
        <Input
          id="brokerPhone"
          value={brokerPhone}
          onChange={(e) => {
            setBrokerPhone(e.target.value);
            if (formErrors.brokerPhone) {
              const { brokerPhone, ...rest } = formErrors;
              setFormErrors(rest);
            }
          }}
          placeholder="Téléphone du courtier"
          className={formErrors.brokerPhone ? "border-destructive" : ""}
        />
        {formErrors.brokerPhone && (
          <p className="text-xs text-destructive">{formErrors.brokerPhone}</p>
        )}
      </div>
    </div>
  );
};
