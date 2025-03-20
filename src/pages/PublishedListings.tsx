
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { PublishedListingsList } from "@/components/PublishedListingsList";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/AppSidebar";

const PublishedListings = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-secondary flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Listings publiés</h1>
          <p className="text-center text-muted-foreground mb-8">
            Consultez et gérez tous vos listings publiés
          </p>
          <PublishedListingsList />
        </div>
      </div>
    </div>
  );
};

export default PublishedListings;
