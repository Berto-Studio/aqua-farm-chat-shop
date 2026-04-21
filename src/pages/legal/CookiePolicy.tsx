import LegalPageLayout, {
  type LegalSection,
} from "@/components/legal/LegalPageLayout";

const sections: LegalSection[] = [
  {
    title: "1. What cookies are",
    body: [
      "Cookies are small text files placed on your browser or device when you visit a website. They help websites remember information between visits or during a single browsing session.",
      "Pomegrid also uses similar browser storage technologies, such as local storage or session storage, where appropriate for core platform features.",
    ],
  },
  {
    title: "2. How Pomegrid uses cookies",
    body: [
      "We use cookies primarily to support essential marketplace functionality, maintain security, and improve the user experience.",
    ],
    bullets: [
      "Authentication cookies help keep users signed in and support secure account access.",
      "Security cookies and related tokens help protect sessions, verify requests, and reduce fraud or unauthorized access.",
      "Preference storage helps remember interface settings such as consent choices and certain browser-based preferences.",
      "Temporary session storage may be used to support checkout or in-progress flows during a browsing session.",
    ],
  },
  {
    title: "3. Types of storage currently used",
    body: [
      "Based on the current platform behavior, the site uses a combination of cookies and browser storage to maintain sessions, store security tokens, remember consent, and preserve limited interface or payment-flow state where necessary.",
      "If additional non-essential cookies are introduced later, this policy and the consent experience should be updated to reflect those changes clearly.",
    ],
  },
  {
    title: "4. Managing cookies in your browser",
    body: [
      "Most browsers let you review, block, or delete cookies through browser settings. You can usually find these options in your browser's privacy or security preferences.",
      "Please note that disabling essential cookies or storage may affect sign-in, checkout continuity, and other important features of the platform.",
    ],
  },
  {
    title: "5. Contact and updates",
    body: [
      "If you have questions about our use of cookies or browser storage, please contact us through the contact page. We may update this Cookie Policy as the platform evolves, and the effective date on this page will be revised when changes are published.",
    ],
  },
];

export default function CookiePolicy() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      description="This page explains how Pomegrid uses cookies and similar browser storage to keep the platform secure, functional, and consistent between visits."
      summary="Cookies and related browser storage support account security, user preferences, and essential marketplace flows. You can control browser cookies through your browser settings, but some features may stop working properly if essential storage is disabled."
      effectiveDate="April 20, 2026"
      currentPath="/cookie-policy"
      sections={sections}
    />
  );
}
