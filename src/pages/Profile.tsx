
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { TemplateManager } from "@/components/profile/TemplateManager";

type FacebookTemplate = Tables<"facebook_templates">;
// Since instagram_templates is not in the types yet, we'll define our own type
type InstagramTemplate = {
  id: string;
  name: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [facebookTemplates, setFacebookTemplates] = useState<FacebookTemplate[]>([]);
  const [instagramTemplates, setInstagramTemplates] = useState<InstagramTemplate[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    getProfile();
    getTemplates();
  }, []);

  const getTemplates = async () => {
    try {
      // Récupérer les templates Facebook
      const { data: fbData, error: fbError } = await supabase
        .from("facebook_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (fbError) throw fbError;
      setFacebookTemplates(fbData || []);
      
      // Récupérer les templates Instagram
      const { data: igData, error: igError } = await supabase
        .from("instagram_templates" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (igError) throw igError;
      setInstagramTemplates(igData as InstagramTemplate[] || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates",
        variant: "destructive",
      });
    }
  };

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger votre profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          
          <div className="glass p-6 rounded-lg">
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ProfileForm 
                profile={profile} 
                onProfileUpdate={setProfile}
              />
            )}
          </div>

          <div className="glass p-6 rounded-lg">
            <TemplateManager 
              facebookTemplates={facebookTemplates}
              instagramTemplates={instagramTemplates}
              onTemplatesUpdate={getTemplates}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
