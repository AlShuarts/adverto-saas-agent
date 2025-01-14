import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export const PricingCard = ({
  title,
  price,
  description,
  features,
  popular,
}: PricingCardProps) => {
  return (
    <Card className={`w-[300px] ${popular ? "border-primary" : ""}`}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {title}
          {popular && (
            <span className="px-2.5 py-0.5 text-xs font-semibold text-primary-foreground bg-primary rounded-full">
              Populaire
            </span>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground">/mois</span>
        </div>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={popular ? "default" : "outline"}>
          Commencer
        </Button>
      </CardFooter>
    </Card>
  );
};