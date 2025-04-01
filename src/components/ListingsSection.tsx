
import { CentrisImport } from "@/components/CentrisImport";
import { CentrisSearchImport } from "@/components/CentrisSearchImport";
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
            <TabsTrigger value="search">Résultats de recherche</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
            <CentrisImport />
          </TabsContent>
          
          <TabsContent value="search">
            <CentrisSearchImport />
          </TabsContent>
        </Tabs>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Vos annonces</h2>
        </div>
        
        <ListingsList />
      </div>
    </div>
  );
};
