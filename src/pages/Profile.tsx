import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { TemplateManager } from "@/components/profile/TemplateManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, FileText, Loader2, Tag } from "lucide-react";
import { useBannerConfig, BannerConfig } from "@/hooks/useBannerConfig";
import { BrokerInfoForm } from "@/components/banner/BrokerInfoForm";
import { ImageUploader } from "@/components/banner/ImageUploader";
import { Button } from "@/components/ui/button";

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
  
  // Banner config state
  const { config, saveConfig } = useBannerConfig();
  const [brokerName, setBrokerName] = useState("");
  const [brokerEmail, setBrokerEmail] = useState("");
  const [brokerPhone, setBrokerPhone] = useState("");
  const [brokerImageUrl, setBrokerImageUrl] = useState<string | null>(null);
  const [agencyLogoUrl, setAgencyLogoUrl] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [savingBanner, setSavingBanner] = useState(false);

  useEffect(() => {
    getProfile();
    getTemplates();
  }, []);
  
  // Load saved banner config
  useEffect(() => {
    if (config) {
      setBrokerName(config.brokerName || "");
      setBrokerEmail(config.brokerEmail || "");
      setBrokerPhone(config.brokerPhone || "");
      setBrokerImageUrl(config.brokerImageUrl);
      setAgencyLogoUrl(config.agencyLogoUrl);
    }
  }, [config]);

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

  const handleSaveBannerConfig = () => {
    const errors: {[key: string]: string} = {};
    
    if (!brokerName.trim()) errors.brokerName = "Le nom est requis";
    if (!brokerEmail.trim()) errors.brokerEmail = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(brokerEmail)) errors.brokerEmail = "Email invalide";
    if (!brokerPhone.trim()) errors.brokerPhone = "Le téléphone est requis";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setSavingBanner(true);
    const newConfig: BannerConfig = {
      brokerName,
      brokerEmail,
      brokerPhone,
      brokerImageUrl,
      agencyLogoUrl
    };
    
    saveConfig(newConfig);
    setSavingBanner(false);
    
    toast({
      title: "Configuration sauvegardée",
      description: "Vos informations de bannière ont été enregistrées",
    });
  };

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Mon Profil
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gérez vos informations personnelles et vos templates
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="min-w-max">
              <TabsTrigger value="profile" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Informations</span>
                <span className="sm:hidden">Infos</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="banner" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                Bannière
              </TabsTrigger>
            </TabsList>
          </div>

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

          <TabsContent value="banner">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informations du courtier</CardTitle>
                  <CardDescription>
                    Ces informations seront utilisées pour personnaliser vos bannières
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BrokerInfoForm
                    brokerName={brokerName}
                    setBrokerName={setBrokerName}
                    brokerEmail={brokerEmail}
                    setBrokerEmail={setBrokerEmail}
                    brokerPhone={brokerPhone}
                    setBrokerPhone={setBrokerPhone}
                    formErrors={formErrors}
                    setFormErrors={setFormErrors}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Images</CardTitle>
                  <CardDescription>
                    Ajoutez votre photo et le logo de votre agence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium mb-3">Photo du courtier</h4>
                      <ImageUploader
                        type="broker"
                        imageUrl={brokerImageUrl}
                        setImageUrl={setBrokerImageUrl}
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-3">Logo de l'agence</h4>
                      <ImageUploader
                        type="agency"
                        imageUrl={agencyLogoUrl}
                        setImageUrl={setAgencyLogoUrl}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSaveBannerConfig} disabled={savingBanner}>
                  {savingBanner ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    "Sauvegarder la configuration"
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;
