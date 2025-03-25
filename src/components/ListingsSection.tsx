
import { CentrisImport } from "@/components/CentrisImport";
import { BrokerProfileImport } from "@/components/BrokerProfileImport";
import { ListingsList } from "@/components/ListingsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSyncListings } from "@/hooks/useSyncListings";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export const ListingsSection = () => {
  const { syncListings, isSyncing, savedBrokerUrl } = useSyncListings();

  const handleSync = () => {
    if (savedBrokerUrl) {
      syncListings(savedBrokerUrl);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Importer des annonces Centris
        </h2>
        
        <Tabs defaultValue="single" className="max-w-xl mx-auto">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="single">Annonce unique</TabsTrigger>
            <TabsTrigger value="bulk">Import en masse</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
            <CentrisImport />
          </TabsContent>
          
          <TabsContent value="bulk">
            <BrokerProfileImport />
          </TabsContent>
        </Tabs>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Vos annonces</h2>
          
          {savedBrokerUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
            </Button>
          )}
        </div>
        
        <ListingsList />
      </div>
    </div>
  );
};
