import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Listings from "./pages/Listings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { useProfile } from "@/hooks/useProfile";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from "@/components/ui/toaster"
import AdminPage from "./pages/Admin";
import AdminErrors from "./pages/AdminErrors";
import { setupConsoleCapture } from "@/hooks/useErrorReport";

const queryClient = new QueryClient()

// Setup console capture for error reporting
setupConsoleCapture();

// Composant pour protéger les routes
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { profile, loading, initialized } = useProfile();
  const location = useLocation();

  // Afficher un indicateur de chargement pendant la vérification
  if (loading || !initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
    return <Navigate to="/auth" state={{ from: location }} />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/" element={
            <PrivateRoute>
              <Index />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute>
              <AdminPage />
            </PrivateRoute>
          } />
          <Route path="/admin/errors" element={
            <PrivateRoute>
              <AdminErrors />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/listings" element={
            <PrivateRoute>
              <Listings />
            </PrivateRoute>
          } />
          {/* Redirect old routes */}
          <Route path="/published-listings" element={<Navigate to="/listings" replace />} />
        </Routes>
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
