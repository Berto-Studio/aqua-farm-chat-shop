import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  type FarmService,
  serviceIconMap,
  serviceTierKeys,
  serviceTierLabels,
} from "@/lib/services";

interface ServiceCardsGridProps {
  services: FarmService[];
  className?: string;
  renderActions?: (service: FarmService) => ReactNode;
}

export default function ServiceCardsGrid({
  services,
  className,
  renderActions,
}: ServiceCardsGridProps) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-8", className)}>
      {services.map((service) => {
        const IconComponent = serviceIconMap[service.icon];

        return (
          <Card key={String(service.id ?? service.title)} className="relative">
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <IconComponent className="h-6 w-6" />
                </div>
                {renderActions ? renderActions(service) : null}
              </div>
              <CardTitle className="text-xl">{service.title}</CardTitle>
              <p className="text-muted-foreground">{service.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">What's Included:</h4>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-semibold">Pricing Options:</h4>
                  {serviceTierKeys.map((tier, index) => {
                    const details = service.pricing[tier];

                    return (
                      <div
                        key={`${index}-${tier}`}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <Badge
                            variant={
                              tier === "premium" ? "default" : "secondary"
                            }
                          >
                            {serviceTierLabels[tier]}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {details.duration}
                          </p>
                        </div>
                        <span className="font-bold text-lg">
                          ${details.price.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
