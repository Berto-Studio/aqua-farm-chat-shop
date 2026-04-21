import LegalPageLayout, {
  type LegalSection,
} from "@/components/legal/LegalPageLayout";

const sections: LegalSection[] = [
  {
    title: "1. Agreement to these terms",
    body: [
      "These Terms and Conditions govern your access to and use of the Pomegrid marketplace, including browsing products, creating an account, placing orders, and communicating with sellers or support.",
      "By using the platform, you agree to follow these terms and all applicable laws. If you do not agree, you should stop using the service.",
    ],
  },
  {
    title: "2. Accounts and access",
    body: [
      "You may be asked to create an account to access certain features. You are responsible for keeping your login credentials confidential and for all activity that happens under your account.",
      "You must provide current, complete, and accurate information when registering and when updating your profile.",
    ],
    bullets: [
      "Use your real identity and valid contact details.",
      "Do not share your account or let another person impersonate you.",
      "Notify us promptly if you believe your account has been accessed without permission.",
    ],
  },
  {
    title: "3. Marketplace listings and product information",
    body: [
      "Pomegrid provides a marketplace where agricultural and aquaculture products or services may be listed. Product descriptions, prices, availability, and images should be accurate, but listings may change as inventory and supplier information are updated.",
      "We may remove or suspend listings that appear misleading, unsafe, fraudulent, or otherwise inconsistent with platform standards.",
    ],
  },
  {
    title: "4. Orders, pricing, and payments",
    body: [
      "Submitting an order request does not guarantee fulfillment. Orders remain subject to availability, pricing confirmation, payment authorization, and any necessary verification checks.",
      "If a product price, fee, or availability changes before fulfillment, we may contact you with updated information or cancel the affected order.",
    ],
    bullets: [
      "You agree to provide authorized payment information.",
      "Failed, disputed, or suspicious transactions may be delayed, canceled, or reviewed.",
      "Applicable taxes, delivery fees, or service charges may appear at checkout where relevant.",
    ],
  },
  {
    title: "5. Delivery, pickup, cancellations, and issues",
    body: [
      "Delivery or pickup timelines are estimates unless a fixed date is expressly confirmed. Delays can happen due to weather, inventory conditions, logistics, or verification requirements.",
      "If something is missing, damaged, or not as described, please contact support as soon as possible so the issue can be reviewed fairly and quickly.",
    ],
  },
  {
    title: "6. Acceptable use",
    body: [
      "You may not use Pomegrid in a way that harms the platform, other users, or marketplace integrity. We may restrict access or remove content when misuse is detected.",
    ],
    bullets: [
      "Do not upload false, unlawful, abusive, or infringing content.",
      "Do not interfere with the platform, security systems, or other users' accounts.",
      "Do not attempt fraud, payment abuse, scraping, or unauthorized access.",
    ],
  },
  {
    title: "7. Intellectual property",
    body: [
      "The Pomegrid brand, platform design, text, software, and original content are protected by intellectual property laws. You may not copy, modify, distribute, or reuse protected materials except as allowed by law or with written permission.",
    ],
  },
  {
    title: "8. Disclaimers and liability",
    body: [
      "Pomegrid works to keep the service available and accurate, but the platform is provided on an as-available basis. We do not guarantee uninterrupted access, perfect accuracy, or that every product or service will meet every specific expectation.",
      "To the fullest extent allowed by law, Pomegrid is not liable for indirect, incidental, or consequential damages arising from platform use, order delays, supplier actions, or third-party services.",
    ],
  },
  {
    title: "9. Changes to these terms",
    body: [
      "We may update these terms from time to time to reflect product changes, legal requirements, or platform improvements. Updated terms will be posted on this page with a revised effective date.",
      "Continued use of the platform after an update means you accept the revised terms.",
    ],
  },
];

export default function TermsAndConditions() {
  return (
    <LegalPageLayout
      title="Terms & Conditions"
      description="These terms explain the rules for using Pomegrid, including account use, listings, orders, payments, and acceptable behavior on the platform."
      summary="Please read these terms carefully before using the marketplace. They set the baseline expectations for buyers, sellers, visitors, and account holders across the platform."
      effectiveDate="April 20, 2026"
      currentPath="/terms-and-conditions"
      sections={sections}
    />
  );
}
