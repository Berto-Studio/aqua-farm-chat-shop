import LegalPageLayout, {
  type LegalSection,
} from "@/components/legal/LegalPageLayout";

const sections: LegalSection[] = [
  {
    title: "1. Information we collect",
    body: [
      "We collect information that helps us operate the Pomegrid marketplace, fulfill orders, support your account, and improve reliability. The information collected depends on how you interact with the platform.",
    ],
    bullets: [
      "Account details such as your name, email address, phone number, and profile information.",
      "Order and transaction details, including items requested, fulfillment information, and payment status metadata.",
      "Messages or support requests you send through chat, forms, or customer service channels.",
      "Technical information such as device, browser, IP address, and platform activity needed for security and troubleshooting.",
    ],
  },
  {
    title: "2. How we use personal information",
    body: [
      "We use personal information to provide the service you request and to keep the platform secure, functional, and responsive.",
    ],
    bullets: [
      "Create and manage user accounts.",
      "Process orders, payments, and customer support requests.",
      "Authenticate users, maintain sessions, and protect against misuse or fraud.",
      "Send important service notices, transactional updates, and platform communications.",
      "Understand platform performance and improve product quality, reliability, and support.",
    ],
  },
  {
    title: "3. Cookies and similar technologies",
    body: [
      "Pomegrid uses cookies and similar browser storage to maintain secure sign-in, remember preferences, support checkout-related flows, and keep core functionality working as expected.",
      "You can learn more about these technologies and your browser options in our Cookie Policy.",
    ],
  },
  {
    title: "4. How we share information",
    body: [
      "We do not sell your personal information. We may share information only when needed to operate the marketplace or comply with legal obligations.",
    ],
    bullets: [
      "With service providers that support hosting, payments, communications, or platform operations.",
      "With sellers, buyers, or logistics partners when needed to fulfill an order or resolve a transaction issue.",
      "With law enforcement, regulators, or other parties when disclosure is required by law or needed to protect rights, safety, or platform integrity.",
    ],
  },
  {
    title: "5. Data retention and security",
    body: [
      "We keep personal information for as long as it is reasonably necessary to provide services, maintain required records, resolve disputes, or meet legal obligations.",
      "We use administrative, technical, and organizational measures designed to protect personal information, but no system can be guaranteed completely secure.",
    ],
  },
  {
    title: "6. Your choices and rights",
    body: [
      "You may update certain account details from your profile or settings. Depending on your location and applicable law, you may also have rights to request access to, correction of, or deletion of your personal information.",
      "To make a privacy-related request, please contact us through the contact page so we can review and respond appropriately.",
    ],
  },
  {
    title: "7. Children and age restrictions",
    body: [
      "Pomegrid is not intended for children who are not legally permitted to use marketplace services in their region. We do not knowingly collect personal information from children in violation of applicable law.",
    ],
  },
  {
    title: "8. Policy updates",
    body: [
      "We may update this Privacy Policy to reflect platform changes, legal requirements, or operational needs. When we do, we will revise the effective date shown on this page.",
      "Your continued use of the platform after an update means you acknowledge the revised policy.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description="This policy explains what information Pomegrid collects, why it is used, how it may be shared, and the choices available to users."
      summary="We collect and use personal information only as needed to operate the marketplace, protect users, process orders, and support the services you request."
      effectiveDate="April 20, 2026"
      currentPath="/privacy-policy"
      sections={sections}
    />
  );
}
