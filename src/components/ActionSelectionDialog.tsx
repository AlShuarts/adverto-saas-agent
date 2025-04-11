import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Facebook, Instagram, Video, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MoveVertical, Play, Pause } from "lucide-react";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";
import { useQueryClient } from "@tanstack/react-query";

type InstagramTemplate = {
  id: string;
  name: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

type ActionSelectionDialogProps = {
  listing: Tables<"listings">;
  isOpen: boolean;
  onClose: () => void;
};

export const ActionSelectionDialog = ({ listing, isOpen, onClose }: ActionSelectionDialogProps) => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [actions, setActions] = useState({
    facebook: false,
    instagram: false,
    slideshow: false,
    banner: false
  });
  
  const [facebookTemplates, setFacebookTemplates] = useState<{ id: string; name: string }[]>([]);
  const [selectedFacebookTemplateId, setSelectedFacebookTemplateId] = useState<string>("none");
  
  const [instagramTemplates, setInstagramTemplates] = useState<{ id: string; name: string }[]>([]);
  const [selectedInstagramTemplateId, setSelectedInstagramTemplateId] = useState<string>("none");
  
  const [musicList, setMusicList] = useState<string[]>([]);
  const [audioPlaying, setAudioPlaying] = useState<HTMLAudioElement | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  
  const [slideshowConfig, setSlideshowConfig] = useState({
    selectedImages: listing.images || [],
    selectedMusic: undefined as string | undefined
  });
  
  const [bannerType, setBannerType] = useState<"VENDU" | "À VENDRE">("VENDU");
  const [bannerImage, setBannerImage] = useState<string | null>(listing.images?.[0] || null);
  
  useEffect(() => {
    if (isOpen) {
      const fetchFacebookTemplates = async () => {
        const { data, error } = await supabase
          .from('facebook_templates')
          .select('id, name');
        
        if (!error && data) {
          setFacebookTemplates(data);
        }
      };
      
      const fetchInstagramTemplates = async () => {
        const { data, error } = await supabase
          .from('instagram_templates' as any)
          .select('id, name');
        
        if (!error && data) {
          setInstagramTemplates(data as {id: string, name: string}[]);
        }
      };
      
      const fetchMusic = async () => {
        const { data, error } = await supabase.storage.from('background-music').list();
        
        if (!error && data) {
          const musicFiles = data
            .filter(file => !file.name.startsWith('.'))
            .map(file => file.name);
          
          setMusicList(musicFiles);
          if (musicFiles.length > 0) {
            setSlideshowConfig(prev => ({ ...prev, selectedMusic: musicFiles[0] }));
          }
        }
      };
      
      fetchFacebookTemplates();
      fetchInstagramTemplates();
      fetchMusic();
    }
  }, [isOpen]);
  
  const handleMusicChange = (value: string) => {
    stopAudio();
    setSlideshowConfig({ ...slideshowConfig, selectedMusic: value });
  };

  const previewMusic = (musicName: string) => {
    if (currentlyPlaying === musicName) {
      stopAudio();
      return;
    }
    stopAudio();
    const audio = new Audio();
    audio.src = `${supabase.storage.from('background-music').getPublicUrl(musicName).data.publicUrl}`;
    audio.volume = 0.5;
    audio.play();
    setAudioPlaying(audio);
    setCurrentlyPlaying(musicName);
  };

  const stopAudio = () => {
    if (audioPlaying) {
      audioPlaying.pause();
      audioPlaying.currentTime = 0;
      setAudioPlaying(null);
      setCurrentlyPlaying(null);
    }
  };
  
  const toggleImageSelection = (imageUrl: string) => {
    if (slideshowConfig.selectedImages.includes(imageUrl)) {
      setSlideshowConfig({
        ...slideshowConfig,
        selectedImages: slideshowConfig.selectedImages.filter(url => url !== imageUrl)
      });
    } else {
      setSlideshowConfig({
        ...slideshowConfig,
        selectedImages: [...slideshowConfig.selectedImages, imageUrl]
      });
    }
  };
  
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(slideshowConfig.selectedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSlideshowConfig({ ...slideshowConfig, selectedImages: items });
  };
  
  const selectBannerImage = (imageUrl: string) => {
    setBannerImage(imageUrl);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const tasks = [];
      
      let socialText = "";
      if (actions.facebook || actions.instagram) {
        const { data, error } = await supabase.functions.invoke("generate-listing-description", {
          body: { listingId: listing.id }
        });
        
        if (error) throw new Error("Erreur lors de la génération du texte");
        socialText = data.text || "";
        
        await ensureAndIncrementStatistic('description');
      }
      
      if (actions.slideshow) {
        tasks.push(
          supabase.functions.invoke("create-slideshow", {
            body: {
              listingId: listing.id,
              config: {
                imageDuration: 3,
                showDetails: true,
                showPrice: true,
                showAddress: true,
                selectedImages: slideshowConfig.selectedImages,
                selectedMusic: slideshowConfig.selectedMusic
              }
            }
          }).then(() => ensureAndIncrementStatistic('slideshow'))
        );
      }
      
      if (actions.banner && bannerImage) {
        tasks.push(
          supabase.functions.invoke("create-sold-banner", {
            body: {
              listingId: listing.id,
              config: {
                bannerType: bannerType,
                mainImage: bannerImage
              }
            }
          })
        );
      }
      
      if (actions.facebook && profile?.facebook_page_id && profile?.facebook_access_token) {
        tasks.push(
          supabase.functions.invoke("facebook-publish", {
            body: {
              message: socialText,
              pageId: profile.facebook_page_id,
              accessToken: profile.facebook_access_token,
              image: listing.images?.[0] || "",
              templateId: selectedFacebookTemplateId === "none" ? undefined : selectedFacebookTemplateId
            }
          }).then(async () => {
            await supabase
              .from("listings")
              .update({ published_to_facebook: true })
              .eq("id", listing.id);
            
            await ensureAndIncrementStatistic('facebook');
          })
        );
      }
      
      if (actions.instagram && profile?.instagram_user_id && profile?.instagram_access_token) {
        tasks.push(
          supabase.functions.invoke("instagram-publish", {
            body: {
              message: socialText,
              images: listing.images?.slice(0, 10) || [],
              listingId: listing.id,
              templateId: selectedInstagramTemplateId === "none" ? undefined : selectedInstagramTemplateId
            }
          }).then(async () => await ensureAndIncrementStatistic('instagram'))
        );
      }
      
      await Promise.allSettled(tasks);
      
      toast({
        title: "Actions complétées",
        description: "Les actions sélectionnées ont été exécutées avec succès.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'exécution des actions:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'exécution des actions sélectionnées.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Actions pour ce listing</DialogTitle>
          <DialogDescription>
            Sélectionnez les actions que vous souhaitez effectuer pour ce listing
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="facebook" 
                checked={actions.facebook} 
                onCheckedChange={(checked) => setActions(prev => ({ ...prev, facebook: !!checked }))} 
              />
              <div className="space-y-1">
                <Label htmlFor="facebook" className="flex items-center">
                  <Facebook className="w-4 h-4 mr-2" />
                  Publication Facebook
                </Label>
                <p className="text-sm text-muted-foreground">
                  Publier cette annonce sur votre page Facebook
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="instagram" 
                checked={actions.instagram} 
                onCheckedChange={(checked) => setActions(prev => ({ ...prev, instagram: !!checked }))} 
              />
              <div className="space-y-1">
                <Label htmlFor="instagram" className="flex items-center">
                  <Instagram className="w-4 h-4 mr-2" />
                  Publication Instagram
                </Label>
                <p className="text-sm text-muted-foreground">
                  Publier cette annonce sur votre compte Instagram
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="slideshow" 
                checked={actions.slideshow} 
                onCheckedChange={(checked) => setActions(prev => ({ ...prev, slideshow: !!checked }))} 
              />
              <div className="space-y-1">
                <Label htmlFor="slideshow" className="flex items-center">
                  <Video className="w-4 h-4 mr-2" />
                  Créer un diaporama
                </Label>
                <p className="text-sm text-muted-foreground">
                  Générer une vidéo diaporama des photos
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="banner" 
                checked={actions.banner} 
                onCheckedChange={(checked) => setActions(prev => ({ ...prev, banner: !!checked }))} 
              />
              <div className="space-y-1">
                <Label htmlFor="banner" className="flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Créer une bannière
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ajouter une bannière "Vendu" ou "À vendre" sur une image
                </p>
              </div>
            </div>
          </div>

          {actions.facebook && (
            <div className="space-y-4 p-4 border rounded-md">
              <h3 className="font-medium">Options de publication Facebook</h3>
              
              <div className="space-y-2">
                <Label htmlFor="facebook-template">Sélectionner un template (optionnel)</Label>
                <Select value={selectedFacebookTemplateId} onValueChange={setSelectedFacebookTemplateId}>
                  <SelectTrigger id="facebook-template">
                    <SelectValue placeholder="Sélectionner un template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun template</SelectItem>
                    {facebookTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {!profile?.facebook_page_id && (
                <p className="text-sm text-amber-500">
                  Vous devez connecter votre page Facebook dans votre profil pour pouvoir publier.
                </p>
              )}
            </div>
          )}
          
          {actions.instagram && (
            <div className="space-y-4 p-4 border rounded-md">
              <h3 className="font-medium">Options de publication Instagram</h3>
              <p className="text-sm">
                Les {Math.min(10, listing.images?.length || 0)} premières images seront utilisées pour la publication.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="instagram-template">Sélectionner un template (optionnel)</Label>
                <Select value={selectedInstagramTemplateId} onValueChange={setSelectedInstagramTemplateId}>
                  <SelectTrigger id="instagram-template">
                    <SelectValue placeholder="Sélectionner un template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun template</SelectItem>
                    {instagramTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {!profile?.instagram_user_id && (
                <p className="text-sm text-amber-500">
                  Vous devez connecter votre compte Instagram dans votre profil pour pouvoir publier.
                </p>
              )}
            </div>
          )}
          
          {actions.slideshow && (
            <div className="space-y-4 p-4 border rounded-md">
              <h3 className="font-medium">Options du diaporama</h3>
              
              <div className="space-y-4">
                <Label>Sélection et ordre des images</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Images disponibles</h4>
                    <div className="grid grid-cols-2 gap-2 border rounded-lg p-2">
                      {listing.images?.map(imageUrl => (
                        <div key={imageUrl} className="relative group">
                          <img src={imageUrl} alt="Property" className="w-full h-24 object-cover rounded" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Checkbox 
                              checked={slideshowConfig.selectedImages.includes(imageUrl)} 
                              onCheckedChange={() => toggleImageSelection(imageUrl)} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Images sélectionnées</h4>
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="selected-images">
                        {provided => (
                          <div 
                            {...provided.droppableProps} 
                            ref={provided.innerRef} 
                            className="border rounded-lg p-2 min-h-[200px]"
                          >
                            {slideshowConfig.selectedImages.map((imageUrl, index) => (
                              <Draggable key={imageUrl} draggableId={imageUrl} index={index}>
                                {provided => (
                                  <div 
                                    ref={provided.innerRef} 
                                    {...provided.draggableProps} 
                                    {...provided.dragHandleProps} 
                                    className="flex items-center gap-2 mb-2 p-2 bg-secondary rounded"
                                  >
                                    <MoveVertical className="w-4 h-4" />
                                    <img src={imageUrl} alt="Selected" className="w-16 h-12 object-cover rounded" />
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => toggleImageSelection(imageUrl)}
                                    >
                                      Retirer
                                    </Button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Musique de fond</h3>
                
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="selectedMusic">Sélectionner une musique</Label>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={slideshowConfig.selectedMusic} 
                      onValueChange={handleMusicChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sélectionner une musique" />
                      </SelectTrigger>
                      <SelectContent>
                        {musicList.map(music => (
                          <SelectItem key={music} value={music}>
                            {music.replace(/\.[^/.]+$/, "")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {slideshowConfig.selectedMusic && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => previewMusic(slideshowConfig.selectedMusic!)}
                      >
                        {currentlyPlaying === slideshowConfig.selectedMusic ? 
                          <Pause className="h-4 w-4" /> : 
                          <Play className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {actions.banner && (
            <div className="space-y-4 p-4 border rounded-md">
              <h3 className="font-medium">Options de la bannière</h3>
              
              <div className="space-y-2">
                <Label htmlFor="banner-type">Type de bannière</Label>
                <Select 
                  value={bannerType} 
                  onValueChange={(value: "VENDU" | "À VENDRE") => setBannerType(value)}
                >
                  <SelectTrigger id="banner-type">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VENDU">VENDU</SelectItem>
                    <SelectItem value="À VENDRE">À VENDRE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Sélectionner une image</Label>
                <div className="grid grid-cols-4 gap-2">
                  {listing.images?.map(imageUrl => (
                    <div 
                      key={imageUrl} 
                      className={`relative cursor-pointer ${bannerImage === imageUrl ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => selectBannerImage(imageUrl)}
                    >
                      <img src={imageUrl} alt="Property" className="w-full h-24 object-cover rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement en cours...
                </>
              ) : "Confirmer les actions"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
