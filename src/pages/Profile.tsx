import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { TemplateManager } from "@/components/profile/TemplateManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, FileText, Loader2 } from "lucide-react";

type FacebookTemplate = Tables<"facebook_templates">;
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
      const { data: fbData, error: fbError } = await supabase
        .from("facebook_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (fbError) throw fbError;
      setFacebookTemplates(fbData || []);
      
      const { data: igData, error: igError } = await supabase
        .from("instagram_templates" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (igError) throw igError;
      setInstagramTemplates(((igData || []) as unknown) as InstagramTemplate[]);
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
    <MainLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Mon Profil
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos informations personnelles et vos templates
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Vos informations de profil et de contact
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ProfileForm 
                    profile={profile} 
                    onProfileUpdate={setProfile}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Templates de publication</CardTitle>
                <CardDescription>
                  Gérez vos modèles de texte pour Facebook et Instagram
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TemplateManager 
                  facebookTemplates={facebookTemplates}
                  instagramTemplates={instagramTemplates}
                  onTemplatesUpdate={getTemplates}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
