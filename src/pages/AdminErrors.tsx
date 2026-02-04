import { useEffect, useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle, Eye, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type ErrorReport = Tables<"error_reports">;

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  new: "destructive",
  investigating: "secondary",
  resolved: "default",
};

const statusLabels: Record<string, string> = {
  new: "Nouveau",
  investigating: "En cours",
  resolved: "Résolu",
};

export default function AdminErrors() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  
  const [errors, setErrors] = useState<ErrorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchErrors();
    }
  }, [isAdmin]);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("error_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (typeFilter !== "all") {
        query = query.eq("error_type", typeFilter);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setErrors(data || []);
    } catch (error) {
      console.error("Error fetching error reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchErrors();
    }
  }, [statusFilter, typeFilter]);

  const updateErrorStatus = async (errorId: string, newStatus: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: Partial<ErrorReport> = {
        status: newStatus,
        admin_notes: adminNotes || selectedError?.admin_notes,
      };

      if (newStatus === "resolved") {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = user?.id;
      }

      const { error } = await supabase
        .from("error_reports")
        .update(updateData)
        .eq("id", errorId);

      if (error) throw error;

      setErrors(prev =>
        prev.map(e => (e.id === errorId ? { ...e, ...updateData } : e))
      );

      if (selectedError?.id === errorId) {
        setSelectedError(prev => prev ? { ...prev, ...updateData } : null);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const saveAdminNotes = async () => {
    if (!selectedError) return;

    try {
      const { error } = await supabase
        .from("error_reports")
        .update({ admin_notes: adminNotes })
        .eq("id", selectedError.id);

      if (error) throw error;

      setErrors(prev =>
        prev.map(e => (e.id === selectedError.id ? { ...e, admin_notes: adminNotes } : e))
      );
      setSelectedError(prev => prev ? { ...prev, admin_notes: adminNotes } : null);
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const uniqueTypes = [...new Set(errors.map(e => e.error_type))];

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Rapports d'erreurs
              </h1>
              <p className="text-muted-foreground mt-1">
                {errors.length} rapport{errors.length !== 1 ? "s" : ""} trouvé{errors.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button onClick={fetchErrors} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Rafraîchir
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="new">Nouveau</SelectItem>
                <SelectItem value="investigating">En cours</SelectItem>
                <SelectItem value="resolved">Résolu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-destructive">
                {errors.filter(e => e.status === "new").length}
              </p>
              <p className="text-xs text-muted-foreground">Nouveaux</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-secondary-foreground">
                {errors.filter(e => e.status === "investigating").length}
              </p>
              <p className="text-xs text-muted-foreground">En cours</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-primary">
                {errors.filter(e => e.status === "resolved").length}
              </p>
              <p className="text-xs text-muted-foreground">Résolus</p>
            </CardContent>
          </Card>
        </div>

        {/* Errors Table */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : errors.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Aucune erreur</AlertTitle>
            <AlertDescription>
              Aucun rapport d'erreur ne correspond aux filtres sélectionnés.
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errors.map(error => (
                    <TableRow key={error.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {error.created_at && format(new Date(error.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{error.user_name || "Anonyme"}</p>
                          <p className="text-xs text-muted-foreground">{error.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{error.error_type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {error.error_message}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[error.status || "new"]}>
                          {statusLabels[error.status || "new"]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedError(error);
                            setAdminNotes(error.admin_notes || "");
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Error Detail Dialog */}
        <Dialog open={!!selectedError} onOpenChange={() => setSelectedError(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Détail de l'erreur
              </DialogTitle>
            </DialogHeader>

            {selectedError && (
              <div className="space-y-6">
                {/* Status & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Statut:</span>
                    <Select
                      value={selectedError.status || "new"}
                      onValueChange={(value) => updateErrorStatus(selectedError.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Nouveau</SelectItem>
                        <SelectItem value="investigating">En cours</SelectItem>
                        <SelectItem value="resolved">Résolu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {selectedError.created_at && format(new Date(selectedError.created_at), "PPpp", { locale: fr })}
                  </span>
                </div>

                {/* User Info */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Utilisateur</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nom:</span>
                        <p className="font-medium">{selectedError.user_name || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{selectedError.user_email || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ID:</span>
                        <p className="font-mono text-xs">{selectedError.user_id || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Error Info */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Erreur</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="ml-2">{selectedError.error_type}</Badge>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Contexte:</span>
                      <p className="font-medium">{selectedError.action_context || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Message:</span>
                      <p className="mt-1 p-2 bg-muted rounded text-sm">{selectedError.error_message}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">URL:</span>
                      <p className="font-mono text-xs break-all">{selectedError.page_url}</p>
                    </div>
                    {selectedError.error_stack && (
                      <div>
                        <span className="text-sm text-muted-foreground">Stack trace:</span>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto max-h-40">
                          {selectedError.error_stack}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Browser Info */}
                {selectedError.browser_info && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Navigateur</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(selectedError.browser_info, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Facebook Response */}
                {selectedError.facebook_response && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Réponse Facebook</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-60">
                        {JSON.stringify(selectedError.facebook_response, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Permissions */}
                {(selectedError.permissions_granted?.length || selectedError.permissions_denied?.length) && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Permissions Facebook</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 space-y-2">
                      {selectedError.permissions_granted?.length && (
                        <div>
                          <span className="text-sm text-muted-foreground">Accordées:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedError.permissions_granted.map(p => (
                              <Badge key={p} variant="default" className="text-xs">{p}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedError.permissions_denied?.length && (
                        <div>
                          <span className="text-sm text-muted-foreground">Refusées:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedError.permissions_denied.map(p => (
                              <Badge key={p} variant="destructive" className="text-xs">{p}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Console Logs */}
                {selectedError.console_logs && Array.isArray(selectedError.console_logs) && selectedError.console_logs.length > 0 && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Logs Console</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-60">
                        {(selectedError.console_logs as string[]).join("\n")}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Admin Notes */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Notes admin</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 space-y-2">
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Ajouter des notes sur cette erreur..."
                      rows={3}
                    />
                    <Button size="sm" onClick={saveAdminNotes}>
                      Enregistrer les notes
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
