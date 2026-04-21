import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export type LegalSection = {
  title: string;
  body: string[];
  bullets?: string[];
};

type LegalPageLayoutProps = {
  title: string;
  description: string;
  summary: string;
  effectiveDate: string;
  currentPath: string;
  sections: LegalSection[];
};

const legalLinks = [
  {
    to: "/terms-and-conditions",
    label: "Terms & Conditions",
    description:
      "Rules for using the marketplace, placing orders, and managing accounts.",
  },
  {
    to: "/privacy-policy",
    label: "Privacy Policy",
    description:
      "How we collect, use, protect, and share personal information.",
  },
  {
    to: "/cookie-policy",
    label: "Cookie Policy",
    description:
      "How cookies and browser storage are used across the platform.",
  },
];

export default function LegalPageLayout({
  title,
  description,
  summary,
  effectiveDate,
  currentPath,
  sections,
}: LegalPageLayoutProps) {
  return (
    <div className="bg-slate-50/70">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Legal
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900">
            {title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <Card className="border-zinc-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Overview</CardTitle>
                <CardDescription>
                  Effective date: {effectiveDate}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-zinc-600">{summary}</p>
                <Separator />
                <p className="text-sm leading-6 text-zinc-600">
                  If you have questions about this policy, please contact our
                  support team through the contact page.
                </p>
              </CardContent>
            </Card>

            {sections.map((section) => (
              <Card key={section.title} className="border-zinc-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm leading-6 text-zinc-600"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets && (
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-600">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-5 self-start lg:sticky lg:top-24">
            <Card className="border-zinc-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Legal Pages</CardTitle>
                <CardDescription>
                  Review the policies that apply to using Pomegrid.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {legalLinks.map((link) => {
                  const isActive = link.to === currentPath;

                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`block rounded-lg border p-4 transition-colors ${
                        isActive
                          ? "border-primary bg-primary/5"
                          : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      <p className="text-sm font-semibold text-zinc-900">
                        {link.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-zinc-600">
                        {link.description}
                      </p>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-zinc-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Need Help?</CardTitle>
                <CardDescription>
                  Our team can help with policy or account questions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-6 text-zinc-600">
                  Reach out if you need clarification about orders, account
                  access, data requests, or platform rules.
                </p>
                <Button asChild className="w-full">
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
