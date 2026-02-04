import { useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell,
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2, RefreshCw, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";

export default function AdminPage() {
  const { isAdmin, isLoading, statistics, error, refreshStatistics } = useAdmin();
  const { profile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile && !isLoading && !isAdmin) {
      navigate("/");
    }
  }, [profile, isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (isAdmin && !isLoading) {
      refreshStatistics();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

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
  
  const totalBanners = statistics.reduce(
    (sum, stat) => sum + (stat.banner_generations || 0),
    0
  );

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Administration
            </h1>
            <p className="text-muted-foreground mt-1">
              Statistiques d'utilisation de la plateforme
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="destructive" className="flex items-center gap-2">
              <Link to="/admin/errors">
                <AlertTriangle className="w-4 h-4" />
                Erreurs
              </Link>
            </Button>
            <Button 
              onClick={refreshStatistics} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> 
              Rafraîchir
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-foreground">{totalDescriptions}</p>
              <p className="text-xs text-muted-foreground">Descriptions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-foreground">{totalSlideshows}</p>
              <p className="text-xs text-muted-foreground">Diaporamas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-foreground">{totalFacebook}</p>
              <p className="text-xs text-muted-foreground">Publications FB</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-foreground">{totalInstagram}</p>
              <p className="text-xs text-muted-foreground">Publications IG</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-foreground">{totalBanners}</p>
              <p className="text-xs text-muted-foreground">Bannières</p>
            </CardContent>
          </Card>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques par utilisateur</CardTitle>
            <CardDescription>
              {statistics.length} utilisateur{statistics.length !== 1 ? "s" : ""} au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Desc.</TableHead>
                  <TableHead className="text-right">Diapo.</TableHead>
                  <TableHead className="text-right">FB</TableHead>
                  <TableHead className="text-right">IG</TableHead>
                  <TableHead className="text-right">Bann.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statistics.map((stat) => {
                  const userName = stat.first_name && stat.first_name !== 'Inconnu' 
                    ? `${stat.first_name} ${stat.last_name || ''}`.trim() 
                    : 'Utilisateur inconnu';
                    
                  const total = 
                    (stat.description_generations || 0) + 
                    (stat.slideshow_generations || 0) + 
                    (stat.facebook_generations || 0) + 
                    (stat.instagram_generations || 0) + 
                    (stat.banner_generations || 0);
                    
                  return (
                    <TableRow key={stat.id}>
                      <TableCell className="font-medium">{userName}</TableCell>
                      <TableCell className="text-muted-foreground">{stat.email || 'Inconnu'}</TableCell>
                      <TableCell className="text-right">{stat.description_generations || 0}</TableCell>
                      <TableCell className="text-right">{stat.slideshow_generations || 0}</TableCell>
                      <TableCell className="text-right">{stat.facebook_generations || 0}</TableCell>
                      <TableCell className="text-right">{stat.instagram_generations || 0}</TableCell>
                      <TableCell className="text-right">{stat.banner_generations || 0}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{total}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
