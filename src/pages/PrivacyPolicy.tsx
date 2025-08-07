import React from 'react';
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Politique de Confidentialité</h1>
            <p className="text-muted-foreground">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          </header>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>1. Collecte des Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Nous collectons les informations que vous nous fournissez directement lorsque vous :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Créez un compte sur notre plateforme</li>
                <li>Utilisez nos services de création de diaporamas et bannières immobilières</li>
                <li>Importez des annonces immobilières</li>
                <li>Contactez notre support client</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>2. Utilisation des Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Nous utilisons vos informations pour :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Fournir et améliorer nos services</li>
                <li>Personnaliser votre expérience utilisateur</li>
                <li>Communiquer avec vous concernant votre compte</li>
                <li>Assurer la sécurité de notre plateforme</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>3. Partage des Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Nous ne vendons pas vos informations personnelles. Nous pouvons partager vos informations dans les cas suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Avec votre consentement explicite</li>
                <li>Pour respecter des obligations légales</li>
                <li>Avec nos prestataires de services de confiance</li>
                <li>En cas de fusion ou acquisition d'entreprise</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>4. Sécurité des Données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Nous mettons en place des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations personnelles contre l'accès non autorisé, la perte, la destruction ou la divulgation.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>5. Vos Droits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification de vos données</li>
                <li>Droit à l'effacement de vos données</li>
                <li>Droit à la portabilité de vos données</li>
                <li>Droit d'opposition au traitement</li>
                <li>Droit de limitation du traitement</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>6. Cookies et Technologies Similaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Notre site utilise des cookies pour améliorer votre expérience de navigation, analyser l'utilisation du site et personnaliser le contenu. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>7. Conservation des Données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Nous conservons vos informations personnelles uniquement le temps nécessaire aux finalités pour lesquelles elles ont été collectées, sauf si une période de conservation plus longue est requise ou autorisée par la loi.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>8. Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, vous pouvez nous contacter à :
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-foreground font-medium">Email : privacy@votre-domaine.com</p>
                <p className="text-foreground">Adresse : [Votre adresse]</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications seront publiées sur cette page avec une date de mise à jour révisée.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;