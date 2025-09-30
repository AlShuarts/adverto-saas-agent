import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Pencil, Trash2, Save, X, Facebook, Instagram } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
type InstagramTemplate = {
  id: string;
  name: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};
type Template = Tables<"facebook_templates"> | InstagramTemplate;
interface TemplateManagerProps {
  facebookTemplates: Tables<"facebook_templates">[];
  instagramTemplates: InstagramTemplate[];
  onTemplatesUpdate: () => void;
}
export const TemplateManager = ({
  facebookTemplates,
  instagramTemplates,
  onTemplatesUpdate
}: TemplateManagerProps) => {
  const [editingTemplate, setEditingTemplate] = useState<Template & {
    type: 'facebook' | 'instagram';
  } | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    content: ""
  });
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState<'facebook' | 'instagram'>('facebook');
  const {
    toast
  } = useToast();
  const handleSaveTemplate = async (template: any) => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      const tableName = template.type === 'facebook' ? 'facebook_templates' : 'instagram_templates';
      if (template.id) {
        const {
          error
        } = await supabase.from(tableName as any).update({
          name: template.name,
          content: template.content
        }).eq("id", template.id);
        if (error) throw error;
      } else {
        const {
          error
        } = await supabase.from(tableName as any).insert({
          name: template.name,
          content: template.content,
          user_id: user.id
        });
        if (error) throw error;
      }
      toast({
        title: "Succès",
        description: "Le template a été sauvegardé"
      });
      setEditingTemplate(null);
      setIsAddingTemplate(false);
      setNewTemplate({
        name: "",
        content: ""
      });
      onTemplatesUpdate();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le template",
        variant: "destructive"
      });
    }
  };
  const handleDeleteTemplate = async (id: string, type: 'facebook' | 'instagram') => {
    try {
      const tableName = type === 'facebook' ? 'facebook_templates' : 'instagram_templates';
      const {
        error
      } = await supabase.from(tableName as any).delete().eq("id", id);
      if (error) throw error;
      toast({
        title: "Succès",
        description: "Le template a été supprimé"
      });
      onTemplatesUpdate();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template",
        variant: "destructive"
      });
    }
  };
  return <div>
      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'facebook' | 'instagram')}>
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6 px-px">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="facebook" className="flex items-center gap-2 flex-1 sm:flex-initial">
              <Facebook className="w-4 h-4" />
              <span className="hidden sm:inline">Templates </span>Facebook
            </TabsTrigger>
            <TabsTrigger value="instagram" className="flex items-center gap-2 flex-1 sm:flex-initial">
              <Instagram className="w-4 h-4" />
              <span className="hidden sm:inline">Templates </span>Instagram
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => {
          setIsAddingTemplate(true);
          setNewTemplate({
            name: "",
            content: ""
          });
        }} disabled={isAddingTemplate} variant="outline" className="h-10 w-full sm:w-auto px-3 text-xs sm:text-sm">
            <PlusCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Nouveau template </span>
            <span className="sm:hidden truncate">Nouveau {activeTab === 'facebook' ? 'FB' : 'IG'}</span>
            <span className="hidden sm:inline whitespace-nowrap">{activeTab === 'facebook' ? 'Facebook' : 'Instagram'}</span>
          </Button>
        </div>

        {isAddingTemplate && <div className="border border-border p-4 rounded-lg mb-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-template-name">Nom du template</Label>
                <Input id="new-template-name" value={newTemplate.name} onChange={e => setNewTemplate({
              ...newTemplate,
              name: e.target.value
            })} placeholder="Ex: Style moderne" />
              </div>
              <div>
                <Label htmlFor="new-template-content">Contenu</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Variables disponibles: {'{price}'}, {'{address}'}, {'{city}'}, {'{bedrooms}'}, {'{bathrooms}'}, {'{description}'}
                </p>
                <Textarea id="new-template-content" value={newTemplate.content} onChange={e => setNewTemplate({
              ...newTemplate,
              content: e.target.value
            })} className="min-h-[150px]" placeholder="Entrez le contenu de votre template..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
              setIsAddingTemplate(false);
              setNewTemplate({
                name: "",
                content: ""
              });
            }}>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button onClick={() => handleSaveTemplate({
              ...newTemplate,
              type: activeTab
            })} disabled={!newTemplate.name || !newTemplate.content}>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </div>
          </div>}

        <TabsContent value="facebook" className="space-y-4 mt-2">
          {facebookTemplates.length === 0 ? <div className="text-center py-8 text-muted-foreground">
              Aucun template Facebook disponible. Créez-en un nouveau !
            </div> : facebookTemplates.map(template => <TemplateItem key={template.id} template={{
          ...template,
          type: 'facebook'
        }} onEdit={(t: any) => setEditingTemplate({
          ...t,
          type: 'facebook'
        })} onDelete={handleDeleteTemplate} onSave={handleSaveTemplate} />)}
        </TabsContent>

        <TabsContent value="instagram" className="space-y-4 mt-2">
          {instagramTemplates.length === 0 ? <div className="text-center py-8 text-muted-foreground">
              Aucun template Instagram disponible. Créez-en un nouveau !
            </div> : instagramTemplates.map(template => <TemplateItem key={template.id} template={{
          ...template,
          type: 'instagram'
        }} onEdit={(t: any) => setEditingTemplate({
          ...t,
          type: 'instagram'
        })} onDelete={handleDeleteTemplate} onSave={handleSaveTemplate} />)}
        </TabsContent>
      </Tabs>
    </div>;
};
interface TemplateItemProps {
  template: (Tables<"facebook_templates"> | InstagramTemplate) & {
    type: 'facebook' | 'instagram';
  };
  onEdit: (template: (Tables<"facebook_templates"> | InstagramTemplate) & {
    type: 'facebook' | 'instagram';
  }) => void;
  onDelete: (id: string, type: 'facebook' | 'instagram') => void;
  onSave: (template: (Tables<"facebook_templates"> | InstagramTemplate) & {
    type: 'facebook' | 'instagram';
  }) => void;
}
const TemplateItem = ({
  template,
  onEdit,
  onDelete,
  onSave
}: TemplateItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState(template);
  const handleEdit = () => {
    setIsEditing(true);
    setEditedTemplate(template);
  };
  const handleSave = async () => {
    await onSave(editedTemplate);
    setIsEditing(false);
  };
  const handleCancel = () => {
    setIsEditing(false);
    setEditedTemplate(template);
  };
  return <div className="border border-border p-4 rounded-lg">
      {isEditing ? <div className="space-y-4">
          <div>
            <Label htmlFor={`template-name-${template.id}`}>Nom du template</Label>
            <Input id={`template-name-${template.id}`} value={editedTemplate.name} onChange={e => setEditedTemplate({
          ...editedTemplate,
          name: e.target.value
        })} />
          </div>
          <div>
            <Label htmlFor={`template-content-${template.id}`}>Contenu</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Variables disponibles: {'{price}'}, {'{address}'}, {'{city}'}, {'{bedrooms}'}, {'{bathrooms}'}, {'{description}'}
            </p>
            <Textarea id={`template-content-${template.id}`} value={editedTemplate.content} onChange={e => setEditedTemplate({
          ...editedTemplate,
          content: e.target.value
        })} className="min-h-[150px]" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={!editedTemplate.name || !editedTemplate.content}>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div> : <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">{template.name}</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(template.id, template.type)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {template.content}
          </p>
        </div>}
    </div>;
};