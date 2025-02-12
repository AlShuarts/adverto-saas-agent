
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Pencil, Trash2, Save, X } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Template = Tables<"facebook_templates">;

interface TemplateManagerProps {
  templates: Template[];
  onTemplatesUpdate: () => void;
}

export const TemplateManager = ({ templates, onTemplatesUpdate }: TemplateManagerProps) => {
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: "", content: "" });
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const { toast } = useToast();

  const handleSaveTemplate = async (template: Partial<Template>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      if (template.id) {
        const { error } = await supabase
          .from("facebook_templates")
          .update({
            name: template.name,
            content: template.content,
          })
          .eq("id", template.id);

        if (error) throw error;
      } else {
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
      onTemplatesUpdate();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from("facebook_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le template a été supprimé",
      });

      onTemplatesUpdate();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le template",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
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
  );
};
