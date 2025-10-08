
import { Navbar } from "@/components/Navbar";
import { ListingsTable } from "@/components/ListingsTable";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useFacebookTokenChecker } from "@/hooks/useFacebookTokenChecker";

const AllListings = () => {
  const navigate = useNavigate();
  useFacebookTokenChecker();

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-center">Tous les listings</h1>
          <div className="w-24"></div> {/* Spacer to balance the layout */}
        </div>
        
        <div className="p-6 bg-card rounded-lg shadow-sm">
          <ListingsTable />
        </div>
      </div>
    </div>
  );
};

export default AllListings;
