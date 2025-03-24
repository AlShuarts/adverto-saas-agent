
import { CentrisImport } from "@/components/CentrisImport";
import { BrokerProfileImport } from "@/components/BrokerProfileImport";
import { ListingsList } from "@/components/ListingsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ListingsSection = () => {
  return (
    <div className="container mx-auto py-8 space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Importer des annonces Centris
        </h2>
        
        <Tabs defaultValue="single" className="max-w-xl mx-auto">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="single">Annonce unique</TabsTrigger>
            <TabsTrigger value="broker">Profil de courtier</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
            <CentrisImport />
          </TabsContent>
          
          <TabsContent value="broker">
            <BrokerProfileImport />
          </TabsContent>
        </Tabs>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6 text-center">Vos annonces</h2>
        <ListingsList />
      </div>
    </div>
  );
};
