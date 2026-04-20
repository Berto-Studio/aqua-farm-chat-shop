import { Link } from "react-router-dom";
import { Button } from "../ui/button";

interface CTAProps {
  title: string;
  description: string;
  primaryText: string;
  primaryLink: string;
  secondaryText?: string;
  secondaryLink?: string;
  className?: string;
}

export default function CTA({
  title,
  description,
  primaryText,
  primaryLink,
  secondaryText,
  secondaryLink,
  className = "",
}: CTAProps) {
  return (
    <section className={`py-16 bg-primary text-white text-center ${className}`}>
      <div className="container">
        <h2 className="text-2xl md:text-4xl font-bold mb-4">{title}</h2>

        <p className="text-lg mb-8 max-w-2xl mx-auto">{description}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" variant="secondary">
            <Link to={primaryLink}>{primaryText}</Link>
          </Button>

          {secondaryText && secondaryLink && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent"
            >
              <Link to={secondaryLink}>{secondaryText}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
