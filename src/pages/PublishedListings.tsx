
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Tables } from "@/integrations/supabase/types";
import { PublishedListingsList } from "@/components/PublishedListingsList";
import { useFacebookTokenChecker } from "@/hooks/useFacebookTokenChecker";

const PublishedListings = () => {
  useFacebookTokenChecker();
  
  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Listings publiés</h1>
        <PublishedListingsList />
      </div>
    </div>
  );
};

export default PublishedListings;
