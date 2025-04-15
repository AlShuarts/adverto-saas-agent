
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { MoveVertical, Play, Pause, Upload, User, Building, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

type PublicationType = "photo" | "slideshow" | "banner";

type MediaSelectorProps = {
  selectedPublicationTypes: PublicationType[];
  images: string[];
  selectedImages: string[];
  bannerImage: string | null;
  bannerType: "VENDU" | "À VENDRE";
  musicList: string[];
  selectedMusic?: string;
  currentlyPlaying: string | null;
  toggleImageSelection: (imageUrl: string) => void;
  onDragEnd: (result: any) => void;
  selectBannerImage: (imageUrl: string) => void;
  handleMusicChange: (value: string) => void;
  previewMusic: (musicName: string) => void;
  setBannerType: (type: "VENDU" | "À VENDRE") => void;
  // Nouveaux props pour les informations du courtier et de l'agence
  brokerImageUrl: string | null;
  setBrokerImageUrl: (url: string | null) => void;
  agencyLogoUrl: string | null;
  setAgencyLogoUrl: (url: string | null) => void;
  brokerName: string;
  setBrokerName: (name: string) => void;
  brokerEmail: string; 
  setBrokerEmail: (email: string) => void;
  brokerPhone: string;
  setBrokerPhone: (phone: string) => void;
  formErrors: {[key: string]: string};
  setFormErrors: (errors: {[key: string]: string}) => void;
};

export const MediaSelector = ({
  selectedPublicationTypes,
  images,
  selectedImages,
  bannerImage,
  bannerType,
  musicList,
  selectedMusic,
  currentlyPlaying,
  toggleImageSelection,
  onDragEnd,
  selectBannerImage,
  handleMusicChange,
  previewMusic,
  setBannerType,
  // Nouveaux props pour les informations du courtier et de l'agence
  brokerImageUrl,
  setBrokerImageUrl,
  agencyLogoUrl,
  setAgencyLogoUrl,
  brokerName,
  setBrokerName,
  brokerEmail,
  setBrokerEmail,
  brokerPhone,
  setBrokerPhone,
  formErrors,
  setFormErrors,
}: MediaSelectorProps) => {
  
  // Fonction pour gérer l'upload d'une image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "broker" | "agency") => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${type}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('listings-images')
          .upload(fileName, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('listings-images')
          .getPublicUrl(fileName);
          
        if (type === "broker") {
          setBrokerImageUrl(publicUrl);
        } else {
          setAgencyLogoUrl(publicUrl);
        }
      } catch (error: any) {
        console.error(`Erreur lors du téléchargement de l'image ${type}:`, error);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Étape 3: Sélectionner les médias</h3>
      
      {selectedPublicationTypes.includes("photo") && (
        <div className="space-y-4 border rounded-md p-4">
          <h4 className="font-medium">Sélection des photos</h4>
          <ScrollArea className="h-[260px] border rounded-lg p-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2">
              {images?.map(imageUrl => (
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
          </ScrollArea>
        </div>
      )}
      
      {selectedPublicationTypes.includes("slideshow") && (
        <div className="space-y-4 border rounded-md p-4">
          <h4 className="font-medium">Configuration du diaporama</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sélection des photos pour le diaporama</Label>
              <ScrollArea className="h-[220px] border rounded-lg p-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
                  {images?.map(imageUrl => (
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
              </ScrollArea>
            </div>
            
            <div className="space-y-2">
              <Label>Ordre des photos</Label>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="selected-images">
                  {provided => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef} 
                      className="border rounded-lg p-2 h-[220px] overflow-y-auto"
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
            <ScrollArea className="h-[220px] border rounded-lg p-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2">
                {images?.map(imageUrl => (
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
            </ScrollArea>
          </div>
          
          {/* Nouvelles sections pour les informations du courtier et de l'agence */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-4 flex items-center">
              <Info className="w-4 h-4 mr-2" /> 
              Informations du courtier
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Photo du courtier */}
              <div className="space-y-2">
                <Label htmlFor="broker-image">Photo du courtier</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('broker-image-input')?.click()}
                    type="button"
                    className="flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                  <input
                    id="broker-image-input"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "broker")}
                  />
                </div>
                {brokerImageUrl && (
                  <div className="w-20 h-20 rounded-full overflow-hidden mt-2">
                    <img
                      src={brokerImageUrl}
                      alt="Photo du courtier"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              
              {/* Logo de l'agence */}
              <div className="space-y-2">
                <Label htmlFor="agency-logo">Logo de l'agence</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('agency-logo-input')?.click()}
                    type="button"
                    className="flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                  <input
                    id="agency-logo-input"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "agency")}
                  />
                </div>
                {agencyLogoUrl && (
                  <div className="w-24 h-12 overflow-hidden mt-2">
                    <img
                      src={agencyLogoUrl}
                      alt="Logo de l'agence"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Informations de contact du courtier */}
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <Label htmlFor="broker-name" className={formErrors.brokerName ? "text-destructive" : ""}>
                  Nom du courtier *
                </Label>
                <Input
                  id="broker-name"
                  value={brokerName}
                  onChange={(e) => {
                    setBrokerName(e.target.value);
                    if (formErrors.brokerName) {
                      const { brokerName, ...rest } = formErrors;
                      setFormErrors(rest);
                    }
                  }}
                  placeholder="Nom du courtier"
                  className={formErrors.brokerName ? "border-destructive" : ""}
                />
                {formErrors.brokerName && (
                  <p className="text-xs text-destructive mt-1">{formErrors.brokerName}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="broker-email" className={formErrors.brokerEmail ? "text-destructive" : ""}>
                  Email du courtier *
                </Label>
                <Input
                  id="broker-email"
                  value={brokerEmail}
                  onChange={(e) => {
                    setBrokerEmail(e.target.value);
                    if (formErrors.brokerEmail) {
                      const { brokerEmail, ...rest } = formErrors;
                      setFormErrors(rest);
                    }
                  }}
                  placeholder="Email du courtier"
                  className={formErrors.brokerEmail ? "border-destructive" : ""}
                />
                {formErrors.brokerEmail && (
                  <p className="text-xs text-destructive mt-1">{formErrors.brokerEmail}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="broker-phone" className={formErrors.brokerPhone ? "text-destructive" : ""}>
                  Téléphone du courtier *
                </Label>
                <Input
                  id="broker-phone"
                  value={brokerPhone}
                  onChange={(e) => {
                    setBrokerPhone(e.target.value);
                    if (formErrors.brokerPhone) {
                      const { brokerPhone, ...rest } = formErrors;
                      setFormErrors(rest);
                    }
                  }}
                  placeholder="Téléphone du courtier"
                  className={formErrors.brokerPhone ? "border-destructive" : ""}
                />
                {formErrors.brokerPhone && (
                  <p className="text-xs text-destructive mt-1">{formErrors.brokerPhone}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
