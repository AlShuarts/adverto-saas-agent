
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Facebook, Instagram, Video, Tag, FileText, Image, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MoveVertical, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";

type PublicationType = "photo" | "slideshow" | "banner";

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
  
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Publication type selection
  const [selectedPublicationTypes, setSelectedPublicationTypes] = useState<PublicationType[]>([]);
  
  // Step 2: Templates
  const [facebookTemplates, setFacebookTemplates] = useState<{ id: string; name: string }[]>([]);
  const [selectedFacebookTemplateId, setSelectedFacebookTemplateId] = useState<string>("none");
  const [instagramTemplates, setInstagramTemplates] = useState<{ id: string; name: string }[]>([]);
  const [selectedInstagramTemplateId, setSelectedInstagramTemplateId] = useState<string>("none");
  
  // Generated text
  const [generatedText, setGeneratedText] = useState<string>("");
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  
  // Step 3: Media selection
  const [selectedImages, setSelectedImages] = useState<string[]>(listing.images || []);
  const [musicList, setMusicList] = useState<string[]>([]);
  const [audioPlaying, setAudioPlaying] = useState<HTMLAudioElement | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<string | undefined>(undefined);
  
  // Banner options
  const [bannerType, setBannerType] = useState<"VENDU" | "À VENDRE">("VENDU");
  const [bannerImage, setBannerImage] = useState<string | null>(listing.images?.[0] || null);
  
  // Step 3.5: Generation status
  const [isGeneratingSlideshow, setIsGeneratingSlideshow] = useState(false);
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);
  const [slideshowUrl, setSlideshowUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  
  // Step 4: Social media selection
  const [selectedNetworks, setSelectedNetworks] = useState({
    facebook: false,
    instagram: false
  });
  
  // Step 5: Publishing
  const [isPublishing, setIsPublishing] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      // Reset state when dialog opens
      setCurrentStep(1);
      setSelectedPublicationTypes([]);
      setSelectedFacebookTemplateId("none");
      setSelectedInstagramTemplateId("none");
      setSelectedImages(listing.images || []);
      setBannerImage(listing.images?.[0] || null);
      setSelectedNetworks({ facebook: false, instagram: false });
      setGeneratedText("");
      setSlideshowUrl(null);
      setBannerUrl(null);
      
      const fetchTemplates = async () => {
        const { data: fbTemplates, error: fbError } = await supabase
          .from('facebook_templates')
          .select('id, name');
        
        if (!fbError && fbTemplates) {
          setFacebookTemplates(fbTemplates);
        }
        
        const { data: igTemplates, error: igError } = await supabase
          .from('instagram_templates')
          .select('id, name');
        
        if (!igError && igTemplates) {
          setInstagramTemplates(igTemplates);
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
            setSelectedMusic(musicFiles[0]);
          }
        }
      };
      
      fetchTemplates();
      fetchMusic();
    }
  }, [isOpen, listing.images]);
  
  const handlePublicationTypeChange = (type: PublicationType, checked: boolean) => {
    setSelectedPublicationTypes(prev => 
      checked 
        ? [...prev, type] 
        : prev.filter(t => t !== type)
    );
  };
  
  const handleMusicChange = (value: string) => {
    stopAudio();
    setSelectedMusic(value);
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
    setSelectedImages(prev => 
      prev.includes(imageUrl)
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };
  
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(selectedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSelectedImages(items);
  };
  
  const selectBannerImage = (imageUrl: string) => {
    setBannerImage(imageUrl);
  };

  const generateText = async () => {
    try {
      setIsGeneratingText(true);
      
      const { data, error } = await supabase.functions.invoke("generate-listing-description", {
        body: { listingId: listing.id }
      });
      
      if (error) throw new Error("Erreur lors de la génération du texte");
      
      setGeneratedText(data.text || "");
      await ensureAndIncrementStatistic('description');
      
      toast({
        title: "Texte généré",
        description: "Le texte de votre publication a été généré avec succès.",
      });
      
    } catch (error) {
      console.error("Erreur lors de la génération du texte:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du texte.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingText(false);
    }
  };
  
  const generateSlideshow = async () => {
    try {
      setIsGeneratingSlideshow(true);
      
      const { data, error } = await supabase.functions.invoke("create-slideshow", {
        body: {
          listingId: listing.id,
          config: {
            imageDuration: 3,
            showDetails: true,
            showPrice: true,
            showAddress: true,
            selectedImages: selectedImages,
            selectedMusic: selectedMusic
          }
        }
      });
      
      if (error) throw error;
      
      await ensureAndIncrementStatistic('slideshow');
      
      // Attendre quelques secondes pour que le traitement commence
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Vérifier le statut jusqu'à ce que le traitement soit terminé
      let isComplete = false;
      while (!isComplete) {
        const { data: statusData } = await supabase
          .from("slideshow_renders")
          .select("video_url, status")
          .eq("listing_id", listing.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
        if (statusData && statusData.status === "completed" && statusData.video_url) {
          setSlideshowUrl(statusData.video_url);
          isComplete = true;
          toast({
            title: "Diaporama créé",
            description: "Le diaporama a été généré avec succès.",
          });
        } else if (statusData && statusData.status === "failed") {
          throw new Error("La création du diaporama a échoué");
        } else {
          // Attendre 5 secondes avant de vérifier à nouveau
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
    } catch (error) {
      console.error("Erreur lors de la création du diaporama:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du diaporama.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSlideshow(false);
    }
  };
  
  const generateBanner = async () => {
    if (!bannerImage) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image pour la bannière.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsGeneratingBanner(true);
      
      const { data, error } = await supabase.functions.invoke("create-sold-banner", {
        body: {
          listingId: listing.id,
          config: {
            bannerType: bannerType,
            mainImage: bannerImage
          }
        }
      });
      
      if (error) throw error;
      
      // Attendre quelques secondes pour que le traitement commence
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Vérifier le statut jusqu'à ce que le traitement soit terminé
      let isComplete = false;
      while (!isComplete) {
        const { data: statusData } = await supabase
          .from("sold_banner_renders")
          .select("image_url, status")
          .eq("listing_id", listing.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
        if (statusData && statusData.status === "completed" && statusData.image_url) {
          setBannerUrl(statusData.image_url);
          isComplete = true;
          toast({
            title: "Bannière créée",
            description: "La bannière a été générée avec succès.",
          });
          await ensureAndIncrementStatistic('banner');
        } else if (statusData && statusData.status === "failed") {
          throw new Error("La création de la bannière a échoué");
        } else {
          // Attendre 5 secondes avant de vérifier à nouveau
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
    } catch (error) {
      console.error("Erreur lors de la création de la bannière:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la bannière.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingBanner(false);
    }
  };
  
  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const tasks = [];
      
      if (!generatedText) {
        toast({
          title: "Erreur",
          description: "Veuillez générer un texte pour votre publication.",
          variant: "destructive"
        });
        return;
      }
      
      // Publication Facebook
      if (selectedNetworks.facebook && profile?.facebook_page_id && profile?.facebook_access_token) {
        let imageToUse = null;
        
        if (selectedPublicationTypes.includes("banner") && bannerUrl) {
          imageToUse = bannerUrl;
        } else if (selectedImages.length > 0) {
          imageToUse = selectedImages[0];
        }
        
        if (imageToUse) {
          tasks.push(
            supabase.functions.invoke("facebook-publish", {
              body: {
                message: generatedText,
                pageId: profile.facebook_page_id,
                accessToken: profile.facebook_access_token,
                image: imageToUse,
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
      }
      
      // Publication Instagram
      if (selectedNetworks.instagram && profile?.instagram_user_id && profile?.instagram_access_token) {
        let imagesToUse = [];
        
        if (selectedPublicationTypes.includes("slideshow") && slideshowUrl) {
          imagesToUse = [slideshowUrl];
        } else if (selectedPublicationTypes.includes("banner") && bannerUrl) {
          imagesToUse = [bannerUrl];
        } else if (selectedImages.length > 0) {
          imagesToUse = selectedImages.slice(0, 10);
        }
        
        if (imagesToUse.length > 0) {
          tasks.push(
            supabase.functions.invoke("instagram-publish", {
              body: {
                message: generatedText,
                images: imagesToUse,
                listingId: listing.id,
                templateId: selectedInstagramTemplateId === "none" ? undefined : selectedInstagramTemplateId
              }
            }).then(async () => {
              await ensureAndIncrementStatistic('instagram');
            })
          );
        }
      }
      
      await Promise.allSettled(tasks);
      
      toast({
        title: "Publications complétées",
        description: "Vos publications ont été créées avec succès sur les réseaux sociaux sélectionnés.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      
      onClose();
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication sur les réseaux sociaux.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };
  
  const canGoToNextStep = () => {
    switch (currentStep) {
      case 1: // Publication type selection
        return selectedPublicationTypes.length > 0;
      case 2: // Template selection
        return true; // Templates are optional
      case 3: // Media selection
        return !(
          (selectedPublicationTypes.includes("photo") && selectedImages.length === 0) ||
          (selectedPublicationTypes.includes("banner") && !bannerImage)
        );
      case 3.5: // Generation step
        const needsSlideshow = selectedPublicationTypes.includes("slideshow");
        const needsBanner = selectedPublicationTypes.includes("banner");
        
        // Can proceed if slideshow URL exists when needed or banner URL exists when needed
        return (!needsSlideshow || slideshowUrl) && (!needsBanner || bannerUrl);
      case 4: // Social network selection
        return selectedNetworks.facebook || selectedNetworks.instagram;
      default:
        return true;
    }
  };
  
  const nextStep = () => {
    // Special case for step 3 to 3.5
    if (currentStep === 3) {
      const needsGeneration = selectedPublicationTypes.includes("slideshow") || selectedPublicationTypes.includes("banner");
      
      if (needsGeneration) {
        setCurrentStep(3.5); // Go to generation step
      } else {
        setCurrentStep(4); // Skip generation step
      }
    } else if (currentStep === 3.5) {
      setCurrentStep(4); // From generation to social network selection
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep === 3.5) {
      setCurrentStep(3); // From generation back to media selection
    } else if (currentStep === 4 && 
              (selectedPublicationTypes.includes("slideshow") || 
               selectedPublicationTypes.includes("banner"))) {
      setCurrentStep(3.5); // From social back to generation if it was used
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Publication type selection
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Étape 1: Choisir le type de publication</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="publication-photo" 
                    checked={selectedPublicationTypes.includes("photo")}
                    onCheckedChange={(checked) => handlePublicationTypeChange("photo", !!checked)}
                  />
                  <div className="space-y-2">
                    <Label 
                      htmlFor="publication-photo" 
                      className="flex items-center cursor-pointer"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Texte avec Photo
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Une publication simple avec du texte et des photos.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="publication-slideshow" 
                    checked={selectedPublicationTypes.includes("slideshow")}
                    onCheckedChange={(checked) => handlePublicationTypeChange("slideshow", !!checked)}
                  />
                  <div className="space-y-2">
                    <Label 
                      htmlFor="publication-slideshow" 
                      className="flex items-center cursor-pointer"
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      Texte avec Diaporama
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Une publication avec un diaporama dynamique de vos photos.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="publication-banner" 
                    checked={selectedPublicationTypes.includes("banner")}
                    onCheckedChange={(checked) => handlePublicationTypeChange("banner", !!checked)}
                  />
                  <div className="space-y-2">
                    <Label 
                      htmlFor="publication-banner" 
                      className="flex items-center cursor-pointer"
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      Texte avec Bannière
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Une publication avec une bannière "Vendu" ou "À vendre".
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 2: // Template selection and text generation
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Étape 2: Choisir un template et générer le texte</h3>
            
            <div className="space-y-4 border rounded-md p-4">
              <div>
                <Label htmlFor="facebook-template">Template Facebook (optionnel)</Label>
                <Select 
                  value={selectedFacebookTemplateId} 
                  onValueChange={setSelectedFacebookTemplateId}
                >
                  <SelectTrigger id="facebook-template" className="mt-1">
                    <SelectValue placeholder="Aucun template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun template</SelectItem>
                    {facebookTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="instagram-template">Template Instagram (optionnel)</Label>
                <Select 
                  value={selectedInstagramTemplateId} 
                  onValueChange={setSelectedInstagramTemplateId}
                >
                  <SelectTrigger id="instagram-template" className="mt-1">
                    <SelectValue placeholder="Aucun template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun template</SelectItem>
                    {instagramTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={generateText} 
                  disabled={isGeneratingText}
                  className="w-full"
                >
                  {isGeneratingText ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : "Générer le texte de la publication"}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="publication-text">Texte de la publication</Label>
              <Textarea
                id="publication-text"
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                placeholder="Votre texte apparaîtra ici après génération"
                className="min-h-[150px]"
              />
            </div>
          </div>
        );
      
      case 3: // Media selection
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Étape 3: Sélectionner les médias</h3>
            
            {selectedPublicationTypes.includes("photo") && (
              <div className="space-y-4 border rounded-md p-4">
                <h4 className="font-medium">Sélection des photos</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border rounded-lg p-2">
                  {listing.images?.map(imageUrl => (
                    <div key={imageUrl} className="relative group">
                      <img src={imageUrl} alt="Property" className="w-full h-24 object-cover rounded" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Checkbox 
                          checked={selectedImages.includes(imageUrl)} 
                          onCheckedChange={() => toggleImageSelection(imageUrl)} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedPublicationTypes.includes("slideshow") && (
              <div className="space-y-4 border rounded-md p-4">
                <h4 className="font-medium">Configuration du diaporama</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sélection des photos pour le diaporama</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border rounded-lg p-2">
                      {listing.images?.map(imageUrl => (
                        <div key={imageUrl} className="relative group">
                          <img src={imageUrl} alt="Property" className="w-full h-24 object-cover rounded" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Checkbox 
                              checked={selectedImages.includes(imageUrl)} 
                              onCheckedChange={() => toggleImageSelection(imageUrl)} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Ordre des photos</Label>
                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="selected-images">
                        {provided => (
                          <div 
                            {...provided.droppableProps} 
                            ref={provided.innerRef} 
                            className="border rounded-lg p-2 min-h-[200px] max-h-[300px] overflow-y-auto"
                          >
                            {selectedImages.map((imageUrl, index) => (
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
                
                <div className="space-y-2">
                  <Label>Musique de fond</Label>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={selectedMusic} 
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
                    
                    {selectedMusic && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => previewMusic(selectedMusic)}
                      >
                        {currentlyPlaying === selectedMusic ? 
                          <Pause className="h-4 w-4" /> : 
                          <Play className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {selectedPublicationTypes.includes("banner") && (
              <div className="space-y-4 border rounded-md p-4">
                <h4 className="font-medium">Configuration de la bannière</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="banner-type">Type de bannière</Label>
                  <Select 
                    value={bannerType} 
                    onValueChange={(value: "VENDU" | "À VENDRE") => setBannerType(value)}
                  >
                    <SelectTrigger id="banner-type" className="mt-1">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VENDU">VENDU</SelectItem>
                      <SelectItem value="À VENDRE">À VENDRE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Sélectionner une image pour la bannière</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
          </div>
        );
        
      case 3.5: // Generation step
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Étape 3.5: Génération des médias</h3>
            
            {selectedPublicationTypes.includes("slideshow") && (
              <div className="space-y-4 border rounded-md p-4">
                <h4 className="font-medium">Génération du diaporama</h4>
                
                {!slideshowUrl ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <Button 
                      onClick={generateSlideshow} 
                      disabled={isGeneratingSlideshow || selectedImages.length === 0}
                      className="w-full"
                    >
                      {isGeneratingSlideshow ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Génération en cours...
                        </>
                      ) : "Générer le diaporama"}
                    </Button>
                    
                    {isGeneratingSlideshow && (
                      <p className="text-sm text-muted-foreground mt-2">
                        La génération peut prendre plusieurs minutes...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-green-500 flex items-center gap-1">
                      <Loader2 className="w-4 h-4" /> Diaporama généré avec succès
                    </span>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSlideshowUrl(null);
                        setIsGeneratingSlideshow(false);
                      }}
                    >
                      Régénérer
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {selectedPublicationTypes.includes("banner") && (
              <div className="space-y-4 border rounded-md p-4">
                <h4 className="font-medium">Génération de la bannière</h4>
                
                {!bannerUrl ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <Button 
                      onClick={generateBanner} 
                      disabled={isGeneratingBanner || !bannerImage}
                      className="w-full"
                    >
                      {isGeneratingBanner ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Génération en cours...
                        </>
                      ) : "Générer la bannière"}
                    </Button>
                    
                    {isGeneratingBanner && (
                      <p className="text-sm text-muted-foreground mt-2">
                        La génération peut prendre quelques minutes...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={bannerUrl} alt="Generated Banner" className="h-16 rounded" />
                      <span className="text-green-500">Bannière générée avec succès</span>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setBannerUrl(null);
                        setIsGeneratingBanner(false);
                      }}
                    >
                      Régénérer
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      
      case 4: // Social media selection
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Étape 4: Sélectionner les réseaux sociaux</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="network-facebook" 
                    checked={selectedNetworks.facebook}
                    onCheckedChange={(checked) => setSelectedNetworks(prev => ({ ...prev, facebook: !!checked }))}
                  />
                  <div className="space-y-2">
                    <Label 
                      htmlFor="network-facebook" 
                      className="flex items-center cursor-pointer"
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Publier sur votre page Facebook professionnelle.
                    </p>
                    
                    {!profile?.facebook_page_id && (
                      <p className="text-sm text-amber-500">
                        Vous devez connecter votre page Facebook dans votre profil.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="network-instagram" 
                    checked={selectedNetworks.instagram}
                    onCheckedChange={(checked) => setSelectedNetworks(prev => ({ ...prev, instagram: !!checked }))}
                  />
                  <div className="space-y-2">
                    <Label 
                      htmlFor="network-instagram" 
                      className="flex items-center cursor-pointer"
                    >
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Publier sur votre compte Instagram professionnel.
                    </p>
                    
                    {!profile?.instagram_user_id && (
                      <p className="text-sm text-amber-500">
                        Vous devez connecter votre compte Instagram dans votre profil.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 5: // Review and publish
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Étape 5: Confirmation et publication</h3>
            
            <div className="border rounded-md p-4">
              <div className="space-y-4">
                <h4 className="font-medium">Récapitulatif de votre publication</h4>
                
                <div className="space-y-2">
                  <p><strong>Type de publication:</strong></p>
                  <ul className="list-disc pl-5">
                    {selectedPublicationTypes.includes("photo") && <li>Texte avec photos</li>}
                    {selectedPublicationTypes.includes("slideshow") && <li>Texte avec diaporama</li>}
                    {selectedPublicationTypes.includes("banner") && <li>Texte avec bannière</li>}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <p><strong>Texte de la publication:</strong></p>
                  <div className="border rounded p-2 bg-muted/50 text-sm">
                    {generatedText ? (
                      <p className="whitespace-pre-wrap">{generatedText.slice(0, 200)}...</p>
                    ) : (
                      <p className="text-muted-foreground italic">Aucun texte généré</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p><strong>Réseaux sociaux sélectionnés:</strong></p>
                  <ul className="list-disc pl-5">
                    {selectedNetworks.facebook && <li>Facebook</li>}
                    {selectedNetworks.instagram && <li>Instagram</li>}
                    {!selectedNetworks.facebook && !selectedNetworks.instagram && (
                      <li className="text-muted-foreground italic">Aucun réseau sélectionné</li>
                    )}
                  </ul>
                </div>
                
                {!selectedNetworks.facebook && !selectedNetworks.instagram && (
                  <p className="text-amber-500 text-sm">
                    Vous devez sélectionner au moins un réseau social pour publier.
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Création d'une nouvelle publication</DialogTitle>
          <DialogDescription>
            Créez une publication personnalisée pour vos réseaux sociaux en quelques étapes.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="w-full bg-muted h-2 rounded-full mb-6">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(currentStep / 5) * 100}%`
            }}
          />
        </div>

        {/* Step Content */}
        <div className="py-4">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <div className="flex gap-2 mt-2 sm:mt-0">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex items-center"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Précédent
              </Button>
            )}
            
            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canGoToNextStep()}
                className="flex items-center"
              >
                Suivant
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || !canGoToNextStep()}
                className="flex items-center"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publication en cours...
                  </>
                ) : "Publier"}
              </Button>
            )}
          </div>
          
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPublishing}
          >
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
