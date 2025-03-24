
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { ListingsTable } from "@/components/ListingsTable";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AllListings = () => {
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
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Tous les listings</h1>
        <ListingsTable />
      </div>
    </div>
  );
};

export default AllListings;
