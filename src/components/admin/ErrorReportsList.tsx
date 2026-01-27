import { useState } from "react";
import { ErrorReport, ErrorReportStatus } from "@/hooks/useErrorReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertCircle, 
  Bug, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Facebook, 
  Instagram, 
  Monitor,
  Search,
  User,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ErrorReportsListProps {
  reports: ErrorReport[];
  onUpdateStatus: (id: string, status: ErrorReportStatus, notes?: string) => Promise<boolean>;
  onRefresh: () => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  new: { label: "Nouveau", color: "bg-red-500/20 text-red-400", icon: AlertCircle },
  investigating: { label: "En cours", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  resolved: { label: "Résolu", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  wont_fix: { label: "Ignoré", color: "bg-gray-500/20 text-gray-400", icon: XCircle },
};

const errorTypeConfig: Record<string, { label: string; icon: React.ElementType }> = {
  facebook_connection: { label: "Connexion Facebook", icon: Facebook },
  instagram_connection: { label: "Connexion Instagram", icon: Instagram },
  facebook_publish: { label: "Publication Facebook", icon: Facebook },
  instagram_publish: { label: "Publication Instagram", icon: Instagram },
  import: { label: "Import", icon: Monitor },
  slideshow: { label: "Diaporama", icon: Monitor },
  other: { label: "Autre", icon: Bug },
};

export const ErrorReportsList = ({ reports, onUpdateStatus, onRefresh }: ErrorReportsListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: ErrorReportStatus) => {
    setUpdating(id);
    try {
      await onUpdateStatus(id, status, adminNotes[id]);
    } finally {
      setUpdating(null);
    }
  };

  if (reports.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <p className="text-muted-foreground">Aucun rapport d'erreur</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => {
        const isExpanded = expandedId === report.id;
        const status = statusConfig[report.status] || statusConfig.new;
        const errorType = errorTypeConfig[report.error_type] || errorTypeConfig.other;
        const StatusIcon = status.icon;
        const TypeIcon = errorType.icon;

        return (
          <Card key={report.id} className="border-border/50 overflow-hidden">
            <CardHeader 
              className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : report.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className={cn("gap-1", status.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <TypeIcon className="h-3 w-3" />
                      {errorType.label}
                    </Badge>
                  </div>
                  
                  <p className="font-medium text-sm text-foreground line-clamp-2">
                    {report.error_message}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {report.user_name || report.user_email || "Anonyme"}
                    </span>
                    <span>
                      {format(new Date(report.created_at), "d MMM yyyy HH:mm", { locale: fr })}
                    </span>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="shrink-0">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="p-4 pt-0 border-t border-border/50 space-y-4">
                {/* Actions rapides */}
                <div className="flex flex-wrap gap-2">
                  <Select
                    value={report.status}
                    onValueChange={(value) => handleStatusChange(report.id, value as ErrorReportStatus)}
                    disabled={updating === report.id}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nouveau</SelectItem>
                      <SelectItem value="investigating">En cours</SelectItem>
                      <SelectItem value="resolved">Résolu</SelectItem>
                      <SelectItem value="wont_fix">Ignoré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes admin */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Notes administrateur
                  </label>
                  <Textarea
                    placeholder="Ajouter des notes sur cette erreur..."
                    value={adminNotes[report.id] ?? report.admin_notes ?? ""}
                    onChange={(e) => setAdminNotes(prev => ({ ...prev, [report.id]: e.target.value }))}
                    className="text-sm"
                    rows={2}
                  />
                </div>

                {/* Détails utilisateur */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-xs text-muted-foreground mb-1">Utilisateur</h4>
                    <p className="text-foreground">{report.user_name || "N/A"}</p>
                    <p className="text-muted-foreground text-xs">{report.user_email || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-xs text-muted-foreground mb-1">Page / Contexte</h4>
                    <p className="text-foreground truncate">{report.page_url || "N/A"}</p>
                    <p className="text-muted-foreground text-xs">{report.action_context || "N/A"}</p>
                  </div>
                </div>

                {/* Stack trace */}
                {report.error_stack && (
                  <div>
                    <h4 className="font-medium text-xs text-muted-foreground mb-1">Stack Trace</h4>
                    <ScrollArea className="h-32 rounded bg-muted/50 p-2">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {report.error_stack}
                      </pre>
                    </ScrollArea>
                  </div>
                )}

                {/* Browser info */}
                {report.browser_info && (
                  <div>
                    <h4 className="font-medium text-xs text-muted-foreground mb-1">Navigateur</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="text-muted-foreground">Platform: {report.browser_info.platform}</span>
                      <span className="text-muted-foreground">Screen: {report.browser_info.screenSize}</span>
                      <span className="text-muted-foreground col-span-2 truncate">UA: {report.browser_info.userAgent}</span>
                    </div>
                  </div>
                )}

                {/* Facebook response */}
                {report.facebook_response && (
                  <div>
                    <h4 className="font-medium text-xs text-muted-foreground mb-1">Réponse Facebook</h4>
                    <ScrollArea className="h-32 rounded bg-muted/50 p-2">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {JSON.stringify(report.facebook_response, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                )}

                {/* Permissions */}
                {(report.permissions_granted || report.permissions_denied) && (
                  <div className="grid grid-cols-2 gap-4">
                    {report.permissions_granted && report.permissions_granted.length > 0 && (
                      <div>
                        <h4 className="font-medium text-xs text-green-400 mb-1">Permissions accordées</h4>
                        <div className="flex flex-wrap gap-1">
                          {report.permissions_granted.map(p => (
                            <Badge key={p} variant="outline" className="text-xs bg-green-500/10">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {report.permissions_denied && report.permissions_denied.length > 0 && (
                      <div>
                        <h4 className="font-medium text-xs text-red-400 mb-1">Permissions refusées</h4>
                        <div className="flex flex-wrap gap-1">
                          {report.permissions_denied.map(p => (
                            <Badge key={p} variant="outline" className="text-xs bg-red-500/10">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Console logs */}
                {report.console_logs && report.console_logs.length > 0 && (
                  <div>
                    <h4 className="font-medium text-xs text-muted-foreground mb-1">
                      Logs Console ({report.console_logs.length})
                    </h4>
                    <ScrollArea className="h-40 rounded bg-muted/50 p-2">
                      {report.console_logs.map((log, i) => (
                        <div key={i} className="text-xs mb-1 font-mono">
                          <span className={cn(
                            "font-medium mr-2",
                            log.type === 'error' && "text-red-400",
                            log.type === 'warn' && "text-yellow-400",
                            log.type === 'info' && "text-blue-400",
                            log.type === 'log' && "text-muted-foreground"
                          )}>
                            [{log.type}]
                          </span>
                          <span className="text-muted-foreground">{log.message}</span>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};
