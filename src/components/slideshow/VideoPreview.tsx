import { Tables } from "@/integrations/supabase/types";

type VideoPreviewProps = {
  videoUrl: string | null;
};

export const VideoPreview = ({ videoUrl }: VideoPreviewProps) => {
  if (!videoUrl) return null;

  return (
    <video controls className="w-full aspect-video" src={videoUrl}>
      Votre navigateur ne supporte pas la lecture de vidéos.
    </video>
  );
};