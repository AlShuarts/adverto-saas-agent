import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

type ErrorContext = {
  errorType: string;
  actionContext?: string;
  facebookResponse?: any;
  permissionsGranted?: string[];
  permissionsDenied?: string[];
  additionalData?: Record<string, any>;
};

type ConsoleLog = {
  type: string;
  message: string;
  timestamp: string;
};

// Stockage global pour les logs console
const consoleLogs: ConsoleLog[] = [];
let isInterceptorSetup = false;

const setupConsoleInterceptor = () => {
  if (isInterceptorSetup) return;
  isInterceptorSetup = true;

  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  const captureLog = (type: string, args: any[]) => {
    const message = args.map(arg => {
      try {
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2).substring(0, 500);
        }
        return String(arg).substring(0, 500);
      } catch {
        return '[Non-serializable]';
      }
    }).join(' ');

    consoleLogs.push({
      type,
      message,
      timestamp: new Date().toISOString(),
    });

    // Garder seulement les 30 derniers logs
    if (consoleLogs.length > 30) {
      consoleLogs.shift();
    }
  };

  console.log = (...args) => {
    captureLog('log', args);
    originalConsole.log(...args);
  };

  console.error = (...args) => {
    captureLog('error', args);
    originalConsole.error(...args);
  };

  console.warn = (...args) => {
    captureLog('warn', args);
    originalConsole.warn(...args);
  };

  console.info = (...args) => {
    captureLog('info', args);
    originalConsole.info(...args);
  };
};

export const useErrorReport = () => {
  const isReportingRef = useRef(false);

  useEffect(() => {
    setupConsoleInterceptor();
  }, []);

  const reportError = useCallback(async (
    error: Error | string,
    context: ErrorContext
  ) => {
    // Éviter les rapports en double
    if (isReportingRef.current) return;
    isReportingRef.current = true;

    try {
      const errorMessage = error instanceof Error ? error.message : error;
      const errorStack = error instanceof Error ? error.stack : undefined;

      // Collecter les informations du navigateur
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookiesEnabled: navigator.cookieEnabled,
        online: navigator.onLine,
      };

      // Obtenir l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      // Récupérer le profil si disponible
      let userName: string | null = null;
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || null;
        }
      }

      // Envoyer le rapport via Edge Function
      const { error: reportErr } = await supabase.functions.invoke('report-error', {
        body: {
          userId: user?.id || null,
          userEmail: user?.email || null,
          userName,
          errorType: context.errorType,
          errorMessage,
          errorStack,
          pageUrl: window.location.href,
          actionContext: context.actionContext,
          browserInfo,
          facebookResponse: context.facebookResponse,
          permissionsGranted: context.permissionsGranted,
          permissionsDenied: context.permissionsDenied,
          consoleLogs: consoleLogs.slice(-20),
          additionalData: context.additionalData,
        }
      });

      if (reportErr) {
        console.error("Échec de l'envoi du rapport d'erreur:", reportErr);
      } else {
        console.log("📧 Rapport d'erreur envoyé aux administrateurs");
      }
    } catch (reportError) {
      // Ne pas bloquer l'utilisateur si le rapport échoue
      console.error("Échec de l'envoi du rapport d'erreur:", reportError);
    } finally {
      isReportingRef.current = false;
    }
  }, []);

  return { reportError };
};

// Export pour utilisation directe sans hook
export const reportErrorDirect = async (
  error: Error | string,
  context: ErrorContext
) => {
  try {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    const browserInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.functions.invoke('report-error', {
      body: {
        userId: user?.id || null,
        userEmail: user?.email || null,
        userName: null,
        errorType: context.errorType,
        errorMessage,
        errorStack,
        pageUrl: window.location.href,
        actionContext: context.actionContext,
        browserInfo,
        facebookResponse: context.facebookResponse,
        consoleLogs: consoleLogs.slice(-20),
        additionalData: context.additionalData,
      }
    });
  } catch (e) {
    console.error("Échec du rapport d'erreur:", e);
  }
};
