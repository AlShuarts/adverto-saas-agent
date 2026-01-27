import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Search } from "lucide-react";

interface ErrorReportsFiltersProps {
  status: string;
  errorType: string;
  search: string;
  onStatusChange: (value: string) => void;
  onErrorTypeChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const ErrorReportsFilters = ({
  status,
  errorType,
  search,
  onStatusChange,
  onErrorTypeChange,
  onSearchChange,
  onRefresh,
  loading,
}: ErrorReportsFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par email, nom ou message..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous statuts</SelectItem>
          <SelectItem value="new">Nouveau</SelectItem>
          <SelectItem value="investigating">En cours</SelectItem>
          <SelectItem value="resolved">Résolu</SelectItem>
          <SelectItem value="wont_fix">Ignoré</SelectItem>
        </SelectContent>
      </Select>

      <Select value={errorType} onValueChange={onErrorTypeChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous types</SelectItem>
          <SelectItem value="facebook_connection">Facebook connexion</SelectItem>
          <SelectItem value="instagram_connection">Instagram connexion</SelectItem>
          <SelectItem value="facebook_publish">Facebook publication</SelectItem>
          <SelectItem value="instagram_publish">Instagram publication</SelectItem>
          <SelectItem value="import">Import</SelectItem>
          <SelectItem value="slideshow">Diaporama</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={onRefresh}
        disabled={loading}
        className="shrink-0"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      </Button>
    </div>
  );
};
