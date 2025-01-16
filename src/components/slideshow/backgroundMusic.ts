import { supabase } from "@/integrations/supabase/client";

export type BackgroundMusic = {
  id: string;
  name: string;
  url: string;
};

export const getBackgroundMusics = async (): Promise<BackgroundMusic[]> => {
  const { data: files, error } = await supabase
    .storage
    .from('background-music')
    .list();

  if (error) {
    console.error('Error fetching background music:', error);
    return [];
  }

  return files.map(file => ({
    id: file.id,
    name: file.name,
    url: supabase.storage.from('background-music').getPublicUrl(file.name).data.publicUrl
  }));
};