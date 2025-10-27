import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FacebookDebug() {
  const { profile } = useProfile();

  const testConnection = async () => {
    console.clear();
    console.log("🔧 MODE DEBUG - Connexion Facebook via Login Button");
    console.log("==========================================");
    console.log("Utilisez le bouton Facebook Login officiel sur la page principale");
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Debug Facebook Connection</CardTitle>
          <CardDescription>
            Utilisez cet outil pour diagnostiquer les problèmes de connexion Facebook
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">📋 Instructions :</p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Ouvrez la console du navigateur (F12)</li>
              <li>Cliquez sur le bouton ci-dessous</li>
              <li>Cochez vos pages dans le popup Facebook</li>
              <li>Analysez les logs dans la console</li>
            </ol>
          </div>

          <Button onClick={testConnection} size="lg" className="w-full">
            Tester la connexion Facebook
          </Button>
          
          {profile?.facebook_page_id && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                ✅ Page connectée : {profile.facebook_page_id}
              </p>
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg text-xs space-y-2">
            <p className="font-medium">🔍 Ce qui sera vérifié :</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Permissions accordées vs refusées</li>
              <li>Pages trouvées depuis /me/accounts</li>
              <li>Pages trouvées depuis Business Manager</li>
              <li>Rôles sur chaque page (Admin/Editor/Moderator requis)</li>
              <li>Présence de tokens d'accès pour chaque page</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
