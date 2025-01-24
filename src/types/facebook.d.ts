interface Window {
  FB: {
    init: (params: {
      appId: string;
      version: string;
    }) => void;
    login: (
      callback: (response: fb.AuthResponse) => void,
      params: { 
        scope: string;
        auth_type?: string;
      }
    ) => void;
    api: (
      path: string,
      callback: (response: any) => void
    ) => void;
  };
}

declare namespace fb {
  interface AuthResponse {
    status: 'connected' | 'not_authorized' | 'unknown';
    authResponse?: {
      accessToken: string;
      expiresIn: string;
      signedRequest: string;
      userID: string;
    };
  }
}