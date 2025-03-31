
import { CentrisImport } from "@/components/CentrisImport";
import { ListingsList } from "@/components/ListingsList";

export const ListingsSection = () => {
  return (
    <div className="container mx-auto py-8 space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Importer des annonces Centris
        </h2>
        
        <div className="max-w-xl mx-auto">
          <CentrisImport />
        </div>
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
