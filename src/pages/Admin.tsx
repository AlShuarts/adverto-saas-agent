import { useEffect, useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useProfile } from "@/hooks/useProfile";
import { useErrorReports, ErrorReportStatus } from "@/hooks/useErrorReports";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Table, 
  TableBody, 
  TableCell,
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, Shield, Bug, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ErrorReportsList } from "@/components/admin/ErrorReportsList";
import { ErrorReportsFilters } from "@/components/admin/ErrorReportsFilters";
import { toast } from "sonner";

export default function AdminPage() {
  const { isAdmin, isLoading, statistics, error, refreshStatistics } = useAdmin();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { reports, loading: reportsLoading, fetchReports, updateStatus, getNewCount } = useErrorReports();
  
  const [activeTab, setActiveTab] = useState("stats");
  const [newErrorCount, setNewErrorCount] = useState(0);
  const [errorFilters, setErrorFilters] = useState({
    status: "all",
    errorType: "all",
    search: "",
  });

  useEffect(() => {
    if (profile && !isLoading && !isAdmin) {
      navigate("/");
    }
  }, [profile, isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (isAdmin && !isLoading) {
      refreshStatistics();
      getNewCount().then(setNewErrorCount);
    }
  }, [isAdmin, isLoading]);

  useEffect(() => {
    if (activeTab === "errors" && isAdmin) {
      fetchReports(errorFilters);
    }
  }, [activeTab, errorFilters, isAdmin]);

  const handleUpdateStatus = async (id: string, status: ErrorReportStatus, notes?: string) => {
    try {
      await updateStatus(id, status, notes);
      toast.success("Statut mis à jour");
      getNewCount().then(setNewErrorCount);
      return true;
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
      return false;
    }
  };

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
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Administration
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestion de la plateforme
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto -mx-2 px-2">
            <TabsList className="min-w-max">
              <TabsTrigger value="stats" className="gap-2 text-xs sm:text-sm">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Statistiques</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="errors" className="gap-2 text-xs sm:text-sm">
                <Bug className="h-4 w-4" />
                <span className="hidden sm:inline">Rapports d'erreurs</span>
                <span className="sm:hidden">Erreurs</span>
                {newErrorCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                    {newErrorCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="stats" className="space-y-6 mt-6">
            <div className="flex justify-end">
              <Button 
                onClick={refreshStatistics} 
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> 
                Rafraîchir
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalDescriptions}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Descriptions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalSlideshows}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Diaporamas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalFacebook}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Publications FB</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalInstagram}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Publications IG</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalBanners}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Bannières</p>
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
                <CardTitle className="text-base sm:text-lg">Statistiques par utilisateur</CardTitle>
                <CardDescription>
                  {statistics.length} utilisateur{statistics.length !== 1 ? "s" : ""} au total
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead className="hidden sm:table-cell">Email</TableHead>
                      <TableHead className="text-right">Desc.</TableHead>
                      <TableHead className="text-right">Diapo.</TableHead>
                      <TableHead className="text-right">FB</TableHead>
                      <TableHead className="text-right">IG</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Bann.</TableHead>
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
                          <TableCell className="font-medium text-xs sm:text-sm">{userName}</TableCell>
                          <TableCell className="text-muted-foreground text-xs hidden sm:table-cell">{stat.email || 'Inconnu'}</TableCell>
                          <TableCell className="text-right text-xs sm:text-sm">{stat.description_generations || 0}</TableCell>
                          <TableCell className="text-right text-xs sm:text-sm">{stat.slideshow_generations || 0}</TableCell>
                          <TableCell className="text-right text-xs sm:text-sm">{stat.facebook_generations || 0}</TableCell>
                          <TableCell className="text-right text-xs sm:text-sm">{stat.instagram_generations || 0}</TableCell>
                          <TableCell className="text-right text-xs sm:text-sm hidden sm:table-cell">{stat.banner_generations || 0}</TableCell>
                          <TableCell className="text-right font-bold text-primary text-xs sm:text-sm">{total}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4 mt-6">
            <ErrorReportsFilters
              status={errorFilters.status}
              errorType={errorFilters.errorType}
              search={errorFilters.search}
              onStatusChange={(status) => setErrorFilters(prev => ({ ...prev, status }))}
              onErrorTypeChange={(errorType) => setErrorFilters(prev => ({ ...prev, errorType }))}
              onSearchChange={(search) => setErrorFilters(prev => ({ ...prev, search }))}
              onRefresh={() => fetchReports(errorFilters)}
              loading={reportsLoading}
            />

            {reportsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ErrorReportsList
                reports={reports}
                onUpdateStatus={handleUpdateStatus}
                onRefresh={() => fetchReports(errorFilters)}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
