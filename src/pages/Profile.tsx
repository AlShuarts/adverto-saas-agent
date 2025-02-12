import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Pencil, Trash2, Save, X } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Template = Tables<"facebook_templates">;

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: "", content: "" });
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getProfile();
    getTemplates();
  }, []);

  const getTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("facebook_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
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
        facebook_post_example: profile.facebook_post_example,
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

  const handleSaveTemplate = async (template: Partial<Template>) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      if (template.id) {
        // Update existing template
        const { error } = await supabase
          .from("facebook_templates")
          .update({
            name: template.name,
            content: template.content,
          })
          .eq("id", template.id);

        if (error) throw error;
      } else {
        // Create new template
        const { error } = await supabase
          .from("facebook_templates")
          .insert({
            name: template.name,
            content: template.content,
            user_id: user.id,
          });

        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: "Le template a été sauvegardé",
      });

      setEditingTemplate(null);
      setIsAddingTemplate(false);
      setNewTemplate({ name: "", content: "" });
      getTemplates();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("facebook_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le template a été supprimé",
      });

      getTemplates();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template",
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
              <form onSubmit={updateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    type="text"
                    value={profile?.first_name || ""}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    type="text"
                    value={profile?.last_name || ""}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nom de l'entreprise</Label>
                  <Input
                    id="company_name"
                    type="text"
                    value={profile?.company_name || ""}
                    onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile?.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook_post_example">Exemple d'annonce Facebook</Label>
                  <Textarea
                    id="facebook_post_example"
                    placeholder="Collez ici un exemple d'une de vos annonces Facebook pour que nous puissions reproduire votre style..."
                    value={profile?.facebook_post_example || ""}
                    onChange={(e) => setProfile({ ...profile, facebook_post_example: e.target.value })}
                    className="min-h-[150px]"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Mise à jour..." : "Mettre à jour"}
                </Button>
              </form>
            )}
          </div>

          <div className="glass p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Templates Facebook</h2>
              <Button
                onClick={() => setIsAddingTemplate(true)}
                disabled={isAddingTemplate}
                variant="outline"
                size="sm"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Nouveau template
              </Button>
            </div>

            {isAddingTemplate && (
              <div className="border border-border p-4 rounded-lg mb-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new-template-name">Nom du template</Label>
                    <Input
                      id="new-template-name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      placeholder="Ex: Style moderne"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-template-content">Contenu</Label>
                    <Textarea
                      id="new-template-content"
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                      className="min-h-[150px]"
                      placeholder="Entrez le contenu de votre template..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingTemplate(false);
                        setNewTemplate({ name: "", content: "" });
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Annuler
                    </Button>
                    <Button
                      onClick={() => handleSaveTemplate(newTemplate)}
                      disabled={!newTemplate.name || !newTemplate.content}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border border-border p-4 rounded-lg">
                  {editingTemplate?.id === template.id ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`template-name-${template.id}`}>Nom du template</Label>
                        <Input
                          id={`template-name-${template.id}`}
                          value={editingTemplate.name}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`template-content-${template.id}`}>Contenu</Label>
                        <Textarea
                          id={`template-content-${template.id}`}
                          value={editingTemplate.content}
                          onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                          className="min-h-[150px]"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setEditingTemplate(null)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Annuler
                        </Button>
                        <Button
                          onClick={() => handleSaveTemplate(editingTemplate)}
                          disabled={!editingTemplate.name || !editingTemplate.content}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">{template.name}</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTemplate(template)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {template.content}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
