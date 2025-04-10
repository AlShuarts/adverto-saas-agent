
import { useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell,
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Navbar } from "@/components/Navbar";

export default function AdminPage() {
  const { isAdmin, isLoading, statistics, error, refreshStatistics } = useAdmin();
  const { profile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    // Si le profil est chargé et que l'utilisateur n'est pas admin, rediriger
    if (profile && !isLoading && !isAdmin) {
      navigate("/");
    }
  }, [profile, isAdmin, isLoading, navigate]);

  useEffect(() => {
    // Rafraîchir les statistiques lorsque la page est chargée
    if (isAdmin && !isLoading) {
      refreshStatistics();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // La redirection se fait dans useEffect
  }

  // Calculer les totaux
  const totalDescriptions = statistics.reduce(
    (sum, stat) => sum + (stat.description_generations || 0), 
    0
  );
  
  const totalSlideshows = statistics.reduce(
    (sum, stat) => sum + (stat.slideshow_generations || 0),
    0
  );

  const totalFacebook = statistics.reduce(
    (sum, stat) => sum + (stat.facebook_generations || 0),
    0
  );

  const totalInstagram = statistics.reduce(
    (sum, stat) => sum + (stat.instagram_generations || 0),
    0
  );

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="container mx-auto py-8 space-y-8">
        <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Générations de descriptions</CardTitle>
              <CardDescription>Nombre total de descriptions générées</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{totalDescriptions}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Générations de diaporamas</CardTitle>
              <CardDescription>Nombre total de diaporamas générés</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{totalSlideshows}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publications Facebook</CardTitle>
              <CardDescription>Nombre total de publications Facebook</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{totalFacebook}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publications Instagram</CardTitle>
              <CardDescription>Nombre total de publications Instagram</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{totalInstagram}</p>
            </CardContent>
          </Card>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end mb-4">
          <Button 
            onClick={refreshStatistics} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> 
            Rafraîchir
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques d'utilisation par utilisateur</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Nombre total d'utilisateurs: {statistics.length}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Descriptions</TableHead>
                  <TableHead className="text-right">Diaporamas</TableHead>
                  <TableHead className="text-right">Facebook</TableHead>
                  <TableHead className="text-right">Instagram</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statistics.map((stat) => {
                  const userName = stat.first_name && stat.first_name !== 'Inconnu' 
                    ? `${stat.first_name} ${stat.last_name || ''}`.trim() 
                    : 'Utilisateur inconnu';
                    
                  return (
                    <TableRow key={stat.id}>
                      <TableCell>{userName}</TableCell>
                      <TableCell>{stat.email || 'Inconnu'}</TableCell>
                      <TableCell className="text-right">{stat.description_generations || 0}</TableCell>
                      <TableCell className="text-right">{stat.slideshow_generations || 0}</TableCell>
                      <TableCell className="text-right">{stat.facebook_generations || 0}</TableCell>
                      <TableCell className="text-right">{stat.instagram_generations || 0}</TableCell>
                      <TableCell className="text-right font-medium">
                        {(stat.description_generations || 0) + 
                         (stat.slideshow_generations || 0) + 
                         (stat.facebook_generations || 0) + 
                         (stat.instagram_generations || 0)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
