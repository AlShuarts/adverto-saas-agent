import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";

interface BrowserInfo {
  userAgent: string;
  language: string;
  platform: string;
  screenSize: string;
  viewportSize: string;
  timezone: string;
  cookiesEnabled: boolean;
  onLine: boolean;
}

interface ErrorReportContext {
  errorType: string;
  actionContext?: string;
  facebookResponse?: any;
  permissionsGranted?: string[];
  permissionsDenied?: string[];
  additionalData?: Record<string, any>;
}

const getBrowserInfo = (): BrowserInfo => ({
  userAgent: navigator.userAgent,
  language: navigator.language,
  platform: navigator.platform,
  screenSize: `${window.screen.width}x${window.screen.height}`,
  viewportSize: `${window.innerWidth}x${window.innerHeight}`,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  cookiesEnabled: navigator.cookieEnabled,
  onLine: navigator.onLine,
});

const getRecentConsoleLogs = (): string[] => {
  // If we have stored logs, return them
  const storedLogs = (window as any).__errorReportLogs || [];
  return storedLogs.slice(-20); // Last 20 logs
};

// Setup console log capture (call this once at app init)
export const setupConsoleCapture = () => {
  if ((window as any).__consoleCapture) return;
  
  const logs: string[] = [];
  const maxLogs = 50;
  
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  const captureLog = (level: string) => (...args: any[]) => {
    const message = args.map(arg => {
      try {
        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
      } catch {
        return String(arg);
      }
    }).join(' ');
    
    logs.push(`[${level}] ${new Date().toISOString()}: ${message}`);
    if (logs.length > maxLogs) logs.shift();
    
    (window as any).__errorReportLogs = logs;
  };

  console.log = (...args) => {
    captureLog('LOG')(...args);
    originalConsole.log.apply(console, args);
  };
  
  console.error = (...args) => {
    captureLog('ERROR')(...args);
    originalConsole.error.apply(console, args);
  };
  
  console.warn = (...args) => {
    captureLog('WARN')(...args);
    originalConsole.warn.apply(console, args);
  };
  
  console.info = (...args) => {
    captureLog('INFO')(...args);
    originalConsole.info.apply(console, args);
  };

  (window as any).__consoleCapture = true;
};

export const useErrorReport = () => {
  const { profile } = useProfile();

  const reportError = async (
    error: Error | unknown,
    context: ErrorReportContext
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      const payload = {
        user_id: user?.id || null,
        user_email: user?.email || null,
        user_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : null,
        error_type: context.errorType,
        error_message: errorMessage,
        error_stack: errorStack,
        page_url: window.location.href,
        action_context: context.actionContext,
        browser_info: getBrowserInfo(),
        facebook_response: context.facebookResponse,
        permissions_granted: context.permissionsGranted,
        permissions_denied: context.permissionsDenied,
        console_logs: getRecentConsoleLogs(),
        additional_data: context.additionalData,
      };

      console.log("📤 Sending error report:", context.errorType);

      const { error: invokeError } = await supabase.functions.invoke('report-error', {
        body: payload
      });

      if (invokeError) {
        console.error("Failed to send error report:", invokeError);
      } else {
        console.log("✅ Error report sent successfully");
      }
    } catch (reportingError) {
      // Don't throw - we don't want error reporting to cause more errors
      console.error("Error while sending error report:", reportingError);
    }
  };

  return { reportError };
};

// Standalone function for use outside of React components
export const reportErrorStandalone = async (
  error: Error | unknown,
  context: ErrorReportContext
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    const payload = {
      user_id: user?.id || null,
      user_email: user?.email || null,
      user_name: null,
      error_type: context.errorType,
      error_message: errorMessage,
      error_stack: errorStack,
      page_url: window.location.href,
      action_context: context.actionContext,
      browser_info: getBrowserInfo(),
      facebook_response: context.facebookResponse,
      permissions_granted: context.permissionsGranted,
      permissions_denied: context.permissionsDenied,
      console_logs: getRecentConsoleLogs(),
      additional_data: context.additionalData,
    };

    await supabase.functions.invoke('report-error', {
      body: payload
    });
  } catch (reportingError) {
    console.error("Error while sending error report:", reportingError);
  }
};
