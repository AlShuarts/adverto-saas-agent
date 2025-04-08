
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import AllListings from "./pages/AllListings";
import PublishedListings from "./pages/PublishedListings";
import { useProfile } from "@/hooks/useProfile";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from "@/components/ui/toaster"

const queryClient = new QueryClient()

// Composant pour protéger les routes
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { profile } = useProfile();

  if (!profile) {
    // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
    return <Navigate to="/auth" />;
  }

  return children;
}

// Importer la page d'administration
import AdminPage from "./pages/Admin";

// Ajoutez la route admin au routeur
function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={
            <PrivateRoute>
              <AdminPage />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/listings" element={
            <PrivateRoute>
              <AllListings />
            </PrivateRoute>
          } />
          <Route path="/published-listings" element={
            <PrivateRoute>
              <PublishedListings />
            </PrivateRoute>
          } />
        </Routes>
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
