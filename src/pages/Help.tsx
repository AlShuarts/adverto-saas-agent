
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/AppSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, FileText, MessageCircle } from "lucide-react";

const Help = () => {
  return (
    <div className="min-h-screen bg-secondary flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Aide & Tutoriels</h1>
          
          <Tabs defaultValue="tutorials" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="tutorials" className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                <span>Tutoriels</span>
              </TabsTrigger>
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>FAQ</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>Contact</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tutorials">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TutorialCard 
                  title="Créer un diaporama" 
                  description="Apprenez à créer un diaporama à partir de vos listings"
                  videoId="diaporama"
                />
                <TutorialCard 
                  title="Publier sur Facebook" 
                  description="Comment publier vos annonces sur Facebook efficacement"
                  videoId="facebook"
                />
                <TutorialCard 
                  title="Créer une bannière VENDU" 
                  description="Ajouter une bannière VENDU à vos propriétés"
                  videoId="banner"
                />
                <TutorialCard 
                  title="Importer depuis Centris" 
                  description="Importer facilement vos annonces depuis Centris"
                  videoId="centris"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle>Questions fréquentes</CardTitle>
                  <CardDescription>
                    Trouvez les réponses aux questions les plus posées
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FaqItem 
                    question="Comment puis-je connecter mon compte Facebook?" 
                    answer="Rendez-vous sur la page Profil et cliquez sur 'Connecter Facebook'. Suivez les instructions pour autoriser ImmoSocial à publier sur votre page."
                  />
                  <FaqItem 
                    question="Pourquoi mon diaporama n'apparaît pas?" 
                    answer="La création d'un diaporama peut prendre quelques minutes. Vous recevrez une notification lorsqu'il sera prêt."
                  />
                  <FaqItem 
                    question="Comment supprimer un listing?" 
                    answer="Actuellement, la fonctionnalité de suppression n'est pas disponible. Nous travaillons à l'implémenter prochainement."
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Nous contacter</CardTitle>
                  <CardDescription>
                    Notre équipe est disponible pour vous aider
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Email: support@immosocial.com</p>
                  <p>Téléphone: +1 (123) 456-7890</p>
                  <p>Heures d'ouverture: Lundi à vendredi, 9h à 17h</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

const TutorialCard = ({ title, description, videoId }) => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayCircle className="w-16 h-16 text-primary opacity-80" />
        </div>
      </div>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
};

const FaqItem = ({ question, answer }) => {
  return (
    <div className="py-3">
      <h4 className="font-medium mb-2">{question}</h4>
      <p className="text-muted-foreground">{answer}</p>
    </div>
  );
};

export default Help;
