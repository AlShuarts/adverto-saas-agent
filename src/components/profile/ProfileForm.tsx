
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface ProfileFormProps {
  profile: Profile;
  onProfileUpdate: (profile: Profile) => void;
}

export const ProfileForm = ({ profile, onProfileUpdate }: ProfileFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      const updates = {
        id: user.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        company_name: profile.company_name,
        phone: profile.phone,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(updates);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre profil a été mis à jour",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={updateProfile} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="first_name">Prénom</Label>
        <Input
          id="first_name"
          type="text"
          value={profile?.first_name || ""}
          onChange={(e) => onProfileUpdate({ ...profile, first_name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="last_name">Nom</Label>
        <Input
          id="last_name"
          type="text"
          value={profile?.last_name || ""}
          onChange={(e) => onProfileUpdate({ ...profile, last_name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company_name">Nom de l'entreprise</Label>
        <Input
          id="company_name"
          type="text"
          value={profile?.company_name || ""}
          onChange={(e) => onProfileUpdate({ ...profile, company_name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          type="tel"
          value={profile?.phone || ""}
          onChange={(e) => onProfileUpdate({ ...profile, phone: e.target.value })}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Mise à jour..." : "Mettre à jour"}
      </Button>
    </form>
  );
};
