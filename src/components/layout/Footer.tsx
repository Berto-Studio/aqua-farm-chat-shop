import { Link } from "react-router-dom";
import {
  ChevronDown,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const quickLinks = [
    { label: "Products", to: "/products" },
    { label: "Services", to: "/services" },
    { label: "About Us", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Calculator", to: "/calculator" },
  ];

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 text-zinc-700">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xl font-bold text-zinc-900"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-100 text-sky-700">
              FF
            </span>
            FishFarm
          </Link>
          <p className="text-sm text-zinc-500">
            Premium catfish and tilapia for your farm, delivered fresh.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 border-b border-zinc-200 pb-8 md:grid-cols-12">
          <div className="md:col-span-2">
            <h3 className="mb-3 text-sm font-semibold text-zinc-900">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="transition-colors hover:text-zinc-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="mb-3 text-sm font-semibold text-zinc-900">
              Products
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/products/catfish"
                  className="transition-colors hover:text-zinc-900"
                >
                  Catfish
                </Link>
              </li>
              <li>
                <Link
                  to="/products/tilapia"
                  className="transition-colors hover:text-zinc-900"
                >
                  Tilapia
                </Link>
              </li>
              <li>
                <Link
                  to="/products/fingerlings"
                  className="transition-colors hover:text-zinc-900"
                >
                  Fingerlings
                </Link>
              </li>
              <li>
                <Link
                  to="/products/mature-fish"
                  className="transition-colors hover:text-zinc-900"
                >
                  Mature Fish
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="mb-3 text-sm font-semibold text-zinc-900">
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-sky-600" />
                <a
                  href="mailto:info@fishfarm.com"
                  className="transition-colors hover:text-zinc-900"
                >
                  info@fishfarm.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-sky-600" />
                <a
                  href="tel:+11234567890"
                  className="transition-colors hover:text-zinc-900"
                >
                  (123) 456-7890
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-sky-600" />
                <span>123 Farm Road, Fish Valley, CA 90210</span>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 md:justify-self-end">
            <button
              type="button"
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700"
            >
              <Globe className="h-4 w-4" />
              English
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              {[
                { icon: Linkedin, label: "LinkedIn", href: "#" },
                { icon: Instagram, label: "Instagram", href: "#" },
                { icon: Facebook, label: "Facebook", href: "#" },
                { icon: Youtube, label: "Youtube", href: "#" },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 transition-colors hover:text-zinc-900"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {currentYear} FishFarm. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="#" className="transition-colors hover:text-zinc-800">
              Terms & Conditions
            </Link>
            <Link to="#" className="transition-colors hover:text-zinc-800">
              Privacy Policy
            </Link>
            <Link to="#" className="transition-colors hover:text-zinc-800">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
