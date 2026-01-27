import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ErrorReport = {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  error_type: string;
  error_message: string;
  error_stack: string | null;
  page_url: string | null;
  action_context: string | null;
  browser_info: Record<string, any> | null;
  facebook_response: Record<string, any> | null;
  permissions_granted: string[] | null;
  permissions_denied: string[] | null;
  console_logs: Array<{ type: string; message: string; timestamp: string }> | null;
  additional_data: Record<string, any> | null;
  status: string;
  admin_notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ErrorReportStatus = 'new' | 'investigating' | 'resolved' | 'wont_fix';

export const useErrorReports = () => {
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async (filters?: {
    status?: string;
    errorType?: string;
    search?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('error_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.errorType && filters.errorType !== 'all') {
        query = query.eq('error_type', filters.errorType);
      }

      if (filters?.search) {
        query = query.or(`user_email.ilike.%${filters.search}%,user_name.ilike.%${filters.search}%,error_message.ilike.%${filters.search}%`);
      }

      const { data, error: fetchError } = await query.limit(100);

      if (fetchError) throw fetchError;

      setReports((data as unknown as ErrorReport[]) || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (
    reportId: string,
    status: ErrorReportStatus,
    adminNotes?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const updateData: Record<string, any> = {
        status,
        admin_notes: adminNotes,
      };

      if (status === 'resolved') {
        updateData.resolved_by = user?.id;
        updateData.resolved_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('error_reports')
        .update(updateData)
        .eq('id', reportId);

      if (updateError) throw updateError;

      // Mettre à jour localement
      setReports(prev => prev.map(r => 
        r.id === reportId 
          ? { ...r, ...updateData } 
          : r
      ));

      return true;
    } catch (err) {
      console.error("Error updating status:", err);
      throw err;
    }
  }, []);

  const getNewCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('error_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.error("Error getting count:", err);
      return 0;
    }
  }, []);

  return {
    reports,
    loading,
    error,
    fetchReports,
    updateStatus,
    getNewCount,
  };
};
