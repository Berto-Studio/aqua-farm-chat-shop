import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const COOKIE_CONSENT_KEY = "pomegrid_cookie_consent";

const getStoredConsent = () => {
  const cookieConsent = Cookies.get(COOKIE_CONSENT_KEY);
  if (cookieConsent === "accepted") {
    return true;
  }

  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
};

const setStoredConsent = () => {
  const secure =
    typeof window !== "undefined"
      ? window.location.protocol === "https:"
      : false;

  Cookies.set(COOKIE_CONSENT_KEY, "accepted", {
    expires: 180,
    sameSite: "Lax",
    secure,
    path: "/",
  });

  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
  } catch {
    // Ignore storage errors in restricted browsers.
  }
};

export default function CookieConsentPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!getStoredConsent());
  }, []);

  const handleAccept = () => {
    setStoredConsent();
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:max-w-md">
      <Card className="border-zinc-200 bg-white shadow-2xl">
        <CardContent className="p-5">
          <p className="text-sm font-semibold text-zinc-900">
            We use cookies
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Pomegrid uses cookies and similar browser storage to keep sign-in
            secure, remember your preferences, and support important marketplace
            features.
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            You can review our{" "}
            <Link
              to="/privacy-policy"
              className="font-medium text-primary underline underline-offset-4"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              to="/cookie-policy"
              className="font-medium text-primary underline underline-offset-4"
            >
              Cookie Policy
            </Link>{" "}
            for more details.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button onClick={handleAccept} className="sm:flex-1">
              Accept cookies
            </Button>
            <Button asChild variant="outline" className="sm:flex-1">
              <Link to="/cookie-policy">View policy</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
