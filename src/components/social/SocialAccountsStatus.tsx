
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SocialAccountsStatus = () => {
  const { profile, loading, connectFacebook, connectInstagram } = useProfile();
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chargement des comptes...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted animate-pulse rounded-md" />
        </CardContent>
      </Card>
    );
  }
  
  if (!profile) {
    return (
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Profil non disponible
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Impossible de charger votre profil. Veuillez réessayer.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate("/profile")}>
            Aller au profil
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className={profile?.facebook_page_id ? "border-green-600/20 bg-green-600/5" : "bg-muted/50"}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Facebook className="h-5 w-5 text-blue-500" />
            Compte Facebook
          </CardTitle>
          <CardDescription>
            {profile?.facebook_page_id 
              ? "Votre page Facebook est connectée" 
              : "Connectez votre page Facebook pour publier des annonces"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile?.facebook_page_id ? (
            <div className="p-4 bg-card rounded-md">
              <p className="font-medium">Page connectée</p>
              <p className="text-sm text-muted-foreground mt-1">
                Vous pouvez maintenant publier directement sur Facebook
              </p>
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <Button onClick={connectFacebook} variant="outline" className="gap-2">
                <Facebook className="h-4 w-4" />
                Connecter Facebook
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className={profile?.instagram_user_id ? "border-green-600/20 bg-green-600/5" : "bg-muted/50"}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Instagram className="h-5 w-5 text-pink-500" />
            Compte Instagram
          </CardTitle>
          <CardDescription>
            {profile?.instagram_user_id 
              ? "Votre compte Instagram est connecté" 
              : "Connectez votre compte Instagram pour publier des annonces"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile?.instagram_user_id ? (
            <div className="p-4 bg-card rounded-md">
              <p className="font-medium">Compte connecté</p>
              <p className="text-sm text-muted-foreground mt-1">
                Vous pouvez maintenant publier directement sur Instagram
              </p>
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <Button onClick={connectInstagram} variant="outline" className="gap-2">
                <Instagram className="h-4 w-4" />
                Connecter Instagram
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
