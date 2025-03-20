
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Share } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialTemplateSelector } from "./SocialTemplateSelector";

export const SocialPublishingList = () => {
  const { data: listings, isLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[300px] rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!listings?.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Aucune annonce</h3>
        <p className="text-muted-foreground">
          Importez votre première annonce Centris pour accéder aux fonctionnalités de publication
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="facebook" className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
        <TabsTrigger value="facebook" className="flex items-center gap-2">
          <Facebook className="w-4 h-4" />
          <span>Facebook</span>
        </TabsTrigger>
        <TabsTrigger value="instagram" className="flex items-center gap-2">
          <Instagram className="w-4 h-4" />
          <span>Instagram</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="facebook">
        <div className="mb-6">
          <SocialTemplateSelector />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <SocialPublishCard 
              key={`fb-${listing.id}`}
              listing={listing}
              network="facebook"
            />
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="instagram">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <SocialPublishCard 
              key={`ig-${listing.id}`}
              listing={listing}
              network="instagram"
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

const SocialPublishCard = ({ listing, network }) => {
  if (!listing.images || listing.images.length === 0) {
    return null;
  }

  const NetworkIcon = network === "facebook" ? Facebook : Instagram;
  const networkName = network === "facebook" ? "Facebook" : "Instagram";
  const isPublished = network === "facebook" ? listing.published_to_facebook : listing.published_to_instagram;

  return (
    <Card className={isPublished ? "border-green-600/20" : ""}>
      <div 
        className="h-40 w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${listing.images[0]})` }}
      />
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base truncate">{listing.title}</CardTitle>
            <CardDescription className="truncate">{listing.address}</CardDescription>
          </div>
          <div className={`p-2 ${network === "facebook" ? "bg-blue-500/10" : "bg-pink-500/10"} rounded-full`}>
            <NetworkIcon className={`h-5 w-5 ${network === "facebook" ? "text-blue-500" : "text-pink-500"}`} />
          </div>
        </div>
      </CardHeader>
      <CardFooter className="p-4 pt-0">
        <Button 
          variant={isPublished ? "outline" : "default"}
          className="w-full"
          disabled={isPublished}
        >
          <Share className="h-4 w-4 mr-2" />
          {isPublished ? `Publié sur ${networkName}` : `Publier sur ${networkName}`}
        </Button>
      </CardFooter>
    </Card>
  );
};
