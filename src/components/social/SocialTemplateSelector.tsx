
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const SocialTemplateSelector = () => {
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("none");

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data, error } = await supabase
        .from('facebook_templates')
        .select('id, name');
      
      if (error) {
        console.error('Error fetching templates:', error);
        return;
      }
      
      setTemplates(data || []);
    };

    fetchTemplates();
  }, []);

  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Template de publication
        </CardTitle>
        <CardDescription>
          Sélectionnez un template pour vos publications Facebook
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner un template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucun template</SelectItem>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};
