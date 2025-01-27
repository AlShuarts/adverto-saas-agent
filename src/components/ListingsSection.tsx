import { CentrisImport } from "@/components/CentrisImport";
import { ListingsList } from "@/components/ListingsList";

export const ListingsSection = () => {
  return (
    <div className="container mx-auto py-8 space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Importer une annonce Centris
        </h2>
        <CentrisImport />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-6 text-center">Vos annonces</h2>
        <ListingsList />
      </div>
    </div>
  );
};