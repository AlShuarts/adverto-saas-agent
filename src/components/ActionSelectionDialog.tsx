import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Facebook, Instagram, Video, Tag, FileText, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MoveVertical, Play, Pause, ChevronLeft, ChevronRight } from "lucide-react";
import { ensureAndIncrementStatistic } from "@/utils/statisticsHelper";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { useSlideshowStatus } from "@/hooks/useSlideshowStatus";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InstagramPreviewContent } from "./InstagramPreviewContent";
import { FacebookPreviewContent } from "./FacebookPreviewContent";

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
  const { toast: uiToast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  
  const [selectedPublicationTypes, setSelectedPublicationTypes] = useState<PublicationType[]>([]);
  
  const [facebookTemplates, setFacebookTemplates] = useState<{ id: string; name: string; content?: string }[]>([]);
  const [selectedFacebookTemplateId, setSelectedFacebookTemplateId] = useState<string>("none");
  const [instagramTemplates, setInstagramTemplates] = useState<{ id: string; name: string }[]>([]);
  const [selectedInstagramTemplateId, setSelectedInstagramTemplateId] = useState<string>("none");
  
  const [generatedText, setGeneratedText] = useState<string>("");
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [musicList, setMusicList] = useState<string[]>([]);
  const [audioPlaying, setAudioPlaying] = useState<HTMLAudioElement | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<string | undefined>(undefined);
  
  const [bannerType, setBannerType] = useState<"VENDU" | "À VENDRE">("VENDU");
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  
  const [isGeneratingSlideshow, setIsGeneratingSlideshow] = useState(false);
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false);
  const [slideshowUrl, setSlideshowUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  
  const [selectedNetworks, setSelectedNetworks] = useState({
    facebook: false,
    instagram: false
  });
  
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [slideshowRenderId, setSlideshowRenderId] = useState<string | null>(null);
  const [slideshowError, setSlideshowError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  
  
  const { 
    data: slideshowRender, 
    isLoading: isSlideshowStatusLoading,
    error: slideshowStatusError,
    refetch: refetchSlideshowStatus
  } = useSlideshowStatus(listing.id);

  
  useEffect(() => {
    if (slideshowRender && selectedPublicationTypes.includes("slideshow")) {
      if ((slideshowRender.status === "completed" || slideshowRender.status === "done") && slideshowRender.video_url) {
        setSlideshowUrl(slideshowRender.video_url);
        setIsGeneratingSlideshow(false);
        toast.success("Diaporama généré avec succès");
      } 
      
      else if (slideshowRender.status === "error" || slideshowRender.status === "failed") {
        setIsGeneratingSlideshow(false);
        setSlideshowError("La génération du diaporama a échoué. Veuillez réessayer.");
        toast.error("Échec de la génération du diaporama");
      }
      
      else if (slideshowRender.status === "pending" || slideshowRender.status === "processing" || slideshowRender.status === "rendering") {
        if (slideshowRenderId) {
          const checkTimer = setTimeout(() => {
            console.log("Vérification périodique du statut du diaporama...");
            refetchSlideshowStatus();
          }, 5000);
          
          return () => clearTimeout(checkTimer);
        }
      }
    }
  }, [slideshowRender, refetchSlideshowStatus, slideshowRenderId, selectedPublicationTypes]);

  
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setSelectedPublicationTypes([]);
      setSelectedFacebookTemplateId("none");
      setSelectedInstagramTemplateId("none");
      setSelectedImages([]);
      setBannerImage(listing.images?.[0] || null);
      setSelectedNetworks({ facebook: false, instagram: false });
      setGeneratedText("");
      setSlideshowUrl(null);
      setBannerUrl(null);
      
      const fetchTemplates = async () => {
        const { data: fbTemplates, error: fbError } = await supabase
          .from('facebook_templates')
          .select('id, name, content');
        
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
        body: { 
          listing: listing,
          templateId: selectedFacebookTemplateId === "none" ? undefined : selectedFacebookTemplateId,
          templateContent: selectedFacebookTemplateId !== "none" ? 
            facebookTemplates.find(t => t.id === selectedFacebookTemplateId)?.content : 
            undefined
        }
      });
      
      if (error) throw new Error("Erreur lors de la génération du texte");
      
      setGeneratedText(data.text || "");
      await ensureAndIncrementStatistic('description');
      
      uiToast({
        title: "Texte généré",
        description: "Le texte de votre publication a été généré avec succès.",
      });
      
    } catch (error) {
      console.error("Erreur lors de la génération du texte:", error);
      uiToast({
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
      setSlideshowError(null);
      
      console.log("Génération du diaporama pour le listing:", listing.id);
      console.log("Images sélectionnées:", selectedImages);
      console.log("Musique sélectionnée:", selectedMusic);
      
      
      toast.info("Génération du diaporama", {
        description: "Nous préparons votre diaporama...",
        duration: 3000
      });
      
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
      
      if (error) {
        console.error("Erreur lors de l'appel à create-slideshow:", error);
        throw error;
      }
      
      console.log("Réponse de create-slideshow:", data);
      
      if (data.renderId) {
        setSlideshowRenderId(data.renderId);
        
        
        await ensureAndIncrementStatistic('slideshow');
        
        toast.success("Diaporama en cours de génération", {
          description: "Ce processus peut prendre quelques minutes",
          duration: 5000
        });
        
        
        setTimeout(() => refetchSlideshowStatus(), 3000);
        
        return data.renderId;
      } else {
        throw new Error("Aucun ID de rendu n'a été retourné");
      }
      
    } catch (error) {
      console.error("Erreur lors de la génération du diaporama:", error);
      setSlideshowError("Une erreur est survenue lors de la génération du diaporama: " + (error.message || "erreur inconnue"));
      toast.error("Erreur lors de la génération du diaporama", {
        description: error.message || "Une erreur inattendue est survenue",
        duration: 5000
      });
      return null;
    } finally {
      
    }
  };
  
  const generateBanner = async () => {
    
    if (!bannerImage) {
      uiToast({
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
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
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
          uiToast({
            title: "Bannière créée",
            description: "La bannière a été générée avec succès.",
          });
          await ensureAndIncrementStatistic('banner');
        } else if (statusData && statusData.status === "failed") {
          throw new Error("La création de la bannière a échoué");
        } else {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
    } catch (error) {
      console.error("Erreur lors de la création de la bannière:", error);
      uiToast({
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
        uiToast({
          title: "Erreur",
          description: "Veuillez générer un texte pour votre publication.",
          variant: "destructive"
        });
        return;
      }
      
      if (selectedNetworks.facebook) {
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
                pageId: profile?.facebook_page_id || 'test-page-id',
                accessToken: profile?.facebook_access_token || 'test-access-token',
                image: imageToUse,
                templateId: selectedFacebookTemplateId === "none" ? undefined : selectedFacebookTemplateId
              }
            }).then(async () => {
              await supabase
                .from("listings")
                .update({ published_to_facebook: true })
                .eq("id", listing.id);
              
              await ensureAndIncrementStatistic('facebook');
            }).catch(error => {
              console.error("Test mode - Facebook publish error:", error);
              toast.success("Facebook test publication completed (test mode)");
            })
          );
        }
      }
      
      if (selectedNetworks.instagram) {
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
            }).catch(error => {
              console.error("Test mode - Instagram publish error:", error);
              toast.success("Instagram test publication completed (test mode)");
            })
          );
        }
      }
      
      await Promise.allSettled(tasks);
      
      uiToast({
        title: "Publications complétées",
        description: "Vos publications ont été créées avec succès sur les réseaux sociaux sélectionnés.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      
      onClose();
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      uiToast({
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
      case 1: 
        return selectedPublicationTypes.length > 0;
      case 2: 
        return true; 
      case 3: 
        return !(
          (selectedPublicationTypes.includes("photo") && selectedImages.length === 0) ||
          (selectedPublicationTypes.includes("banner") && !bannerImage)
        );
      case 3.5: 
        const needsSlideshow = selectedPublicationTypes.includes("slideshow");
        const needsBanner = selectedPublicationTypes.includes("banner");
        
        const slideshowReady = !needsSlideshow || slideshowUrl;
        const bannerReady = !needsBanner || bannerUrl;
        
        return slideshowReady && bannerReady;
      case 4: 
        return selectedNetworks.facebook || selectedNetworks.instagram;
      default:
        return true;
    }
  };
  
  const nextStep = () => {
    if (currentStep === 3) {
      const needsGeneration = selectedPublicationTypes.includes("slideshow") || selectedPublicationTypes.includes("banner");
      
      if (needsGeneration) {
        setCurrentStep(3.5);
      } else {
        setCurrentStep(4);
      }
    } else if (currentStep === 3.5) {
      setCurrentStep(4);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep === 3.5) {
      setCurrentStep(3);
    } else if (currentStep === 4 && 
              (selectedPublicationTypes.includes("slideshow") || 
               selectedPublicationTypes.includes("banner"))) {
      setCurrentStep(3.5);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderSlideshowGenerationStep = () => {
    return (
      <div className="space-y-4 border rounded-md p-4">
        <h4 className="font-medium">Génération du diaporama</h4>
        
        {!slideshowUrl ? (
          <div className="flex flex-col items-center justify-center py-4">
            {isGeneratingSlideshow ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Génération du diaporama en cours...
                </p>
                <p className="text-xs text-muted-foreground">
                  Ce processus peut prendre plusieurs minutes.
                </p>
              </div>
            ) : slideshowRenderId && !slideshowError ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Traitement en cours...
                </p>
                <p className="text-xs text-muted-foreground">
                  Votre diaporama est en train d'être généré. Veuillez patienter.
                </p>
                
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => refetchSlideshowStatus()}
                >
                  Vérifier le statut
                </Button>
              </div>
            ) : (
              <>
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
                
                {slideshowError && (
                  <div className="text-sm text-red-500 mt-2">
                    {slideshowError}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-green-500 flex items-center gap-1">
                <Video className="w-4 h-4" /> Diaporama généré avec succès
              </span>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSlideshowUrl(null);
                  setSlideshowRenderId(null);
                  setIsGeneratingSlideshow(false);
                }}
              >
                Régénérer
              </Button>
            </div>
            
            
            <div className="border rounded-md p-2 bg-muted/20">
              <div className="flex justify-center">
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(slideshowUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Prévisualiser le diaporama
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: 
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
      
      case 2: 
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
      
      case 3: 
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
                
                <div>
                  <Label htmlFor="banner-type">Type de bannière</Label>
                  <Select 
                    value={bannerType} 
                    onValueChange={(value) => setBannerType(value as "VENDU" | "À VENDRE")}
                  >
                    <SelectTrigger id="banner-type" className="mt-1">
                      <SelectValue placeholder="Type de bannière" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VENDU">VENDU</SelectItem>
                      <SelectItem value="À VENDRE">À VENDRE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Sélection de l'image principale</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border rounded-lg p-2">
                    {listing.images?.map(imageUrl => (
                      <div
                        key={imageUrl}
                        className={`relative cursor-pointer border-2 ${
                          bannerImage === imageUrl ? "border-primary" : "border-transparent"
                        } rounded overflow-hidden`}
                        onClick={() => selectBannerImage(imageUrl)}
                      >
                        <img
                          src={imageUrl}
                          alt="Property"
                          className="w-full h-24 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      case 3.5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Étape 3.5: Génération des médias</h3>
            
            {selectedPublicationTypes.includes("slideshow") && renderSlideshowGenerationStep()}
            
            {selectedPublicationTypes.includes("banner") && (
              <div className="space-y-4 border rounded-md p-4">
                <h4 className="font-medium">Génération de la bannière</h4>
                
                {!bannerUrl ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    {isGeneratingBanner ? (
                      <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                          Création de la bannière en cours...
                        </p>
                      </div>
                    ) : (
                      <>
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
                        
                        {bannerError && (
                          <div className="text-sm text-red-500 mt-2">
                            {bannerError}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-green-500 flex items-center gap-1">
                        <Tag className="w-4 h-4" /> Bannière générée avec succès
                      </span>
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
                    
                    <div className="border rounded-md p-2 bg-muted/20">
                      <img src={bannerUrl} alt="Bannière générée" className="max-h-[200px] mx-auto" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Étape 4: Publier sur les réseaux sociaux</h3>
            
            <div className="space-y-4 border rounded-md p-4">
              <h4 className="font-medium">Sélection des réseaux sociaux</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="network-facebook" 
                      checked={selectedNetworks.facebook}
                      onCheckedChange={(checked) => setSelectedNetworks({
                        ...selectedNetworks,
                        facebook: !!checked
                      })}
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
                        Publier sur votre page Facebook.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-all">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="network-instagram" 
                      checked={selectedNetworks.instagram}
                      onCheckedChange={(checked) => setSelectedNetworks({
                        ...selectedNetworks,
                        instagram: !!checked
                      })}
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
                        Publier sur votre compte Instagram.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Aperçu des publications</h4>
              
              <Tabs defaultValue="facebook" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="facebook" disabled={!selectedNetworks.facebook}>
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </TabsTrigger>
                  <TabsTrigger value="instagram" disabled={!selectedNetworks.instagram}>
                    <Instagram className="w-4 h-4 mr-2" />
                    Instagram
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="facebook">
                  {selectedNetworks.facebook ? (
                    <div className="border rounded-md p-4">
                      <FacebookPreviewContent 
                        isLoading={false}
                        error={null}
                        generatedText={generatedText}
                        images={
                          selectedPublicationTypes.includes("banner") && bannerUrl 
                            ? [bannerUrl] 
                            : selectedImages.slice(0, 1)
                        }
                        onTextChange={(text) => setGeneratedText(text)}
                        selectedImages={selectedImages}
                        onSelectedImagesChange={setSelectedImages}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
                      <Facebook className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Sélectionnez Facebook pour voir l'aperçu.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="instagram">
                  {selectedNetworks.instagram ? (
                    <div className="border rounded-md p-4">
                      <InstagramPreviewContent 
                        isLoading={false}
                        error={null}
                        generatedText={generatedText}
                        images={
                          selectedPublicationTypes.includes("slideshow") && slideshowUrl
                            ? [slideshowUrl]
                            : selectedPublicationTypes.includes("banner") && bannerUrl
                              ? [bannerUrl]
                              : selectedImages.slice(0, 10)
                        }
                        onTextChange={(text) => setGeneratedText(text)}
                        selectedImages={selectedImages}
                        onSelectedImagesChange={setSelectedImages}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
                      <Instagram className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Sélectionnez Instagram pour voir l'aperçu.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Publication sur les réseaux sociaux</DialogTitle>
          <DialogDescription>
            Créez une publication pour diffuser votre bien immobilier sur les réseaux sociaux.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          {renderStepContent()}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <div className="flex-1 flex">
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
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            
            {currentStep < 4 ? (
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
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publication...
                  </>
                ) : "Publier"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
