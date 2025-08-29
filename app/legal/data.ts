export const SITE = 'RabbitHole';
export const COMPANY = 'Rabbit Tale & Company. z o.o.';
export const CONTACT_EMAIL = 'support@rabbit-hole.app';
export const ADDRESS = 'Your Street 1, 00-000 City, Country';
export const EFFECTIVE_PRIVACY = '2025-08-29';
export const EFFECTIVE_TERMS = '2025-08-29';

// ---------------------- Privacy ----------------------

export const PRIVACY_SECTIONS = [
  { id: 'controller', title: 'Controller' },
  { id: 'data', title: 'Data' },
  { id: 'sources', title: 'Sources' },
  { id: 'purposes', title: 'Purposes & Bases' },
  { id: 'automated', title: 'Automation' },
  { id: 'recipients', title: 'Recipients' },
  { id: 'transfers', title: 'Transfers' },
  { id: 'retention', title: 'Retention' },
  { id: 'rights', title: 'Your Rights' },
  { id: 'cookies', title: 'Cookies' },
  { id: 'children', title: 'Children' },
  { id: 'security', title: 'Security' },
  { id: 'complaints', title: 'Complaints (UODO)' },
  { id: 'changes', title: 'Changes' },
];

// Types for legal content
export type ListItem = string | { text: string; items: ListItem[] };
export type ContentBlock = { type: 'p'; text: string } | { type: 'ul'; items: ListItem[] };

// Full content definition for Privacy page.
// Supports basic markdown-style links: [label](href). Placeholders {SITE}, {COMPANY}, {ADDRESS}, {CONTACT_EMAIL}, {COMPANY_ADDR} are replaced at render time.
export const PRIVACY_CONTENT: Array<
  { id: string; title: string; blocks: Array<ContentBlock> }
> = [
  {
    id: 'intro',
    title: 'Introduction',
    blocks: [
      { type: 'p', text: 'This Privacy Policy explains how **{SITE}** (“we”, “us”, “our”) collects, uses, and protects your personal information when you use our website and services (collectively, the “Service”). We are committed to protecting your privacy in compliance with the European Union’s General Data Protection Regulation (GDPR) and other applicable privacy laws.' },
      { type: 'p', text: '' },
      { type: 'p', text: 'By using {SITE}, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree, please refrain from using the Service.' },
    ],
  },
  {
    id: 'controller',
    title: '1. Controller & Contact',
    blocks: [
      {
        type: 'p',
        text: 'The “controller” of your personal data – i.e., the organization responsible for data processing – is **{COMPANY}**, the operator of RabbitHole.'
      },
      {
        type: 'ul',
        items: [
          'Company Name: {COMPANY}',
          'Registered Address: {ADDRESS}',
          'Contact Email: [CONTACT_EMAIL](mailto:{CONTACT_EMAIL})',
        ],
      },
      {
        type: 'p',
        text: 'If you have questions or requests regarding your personal data, you can contact us by email. We may also designate a Data Protection Officer (DPO) or representative in the EU if required; if so, we will provide their contact details on our website or upon request.'
      },
    ],
  },
  {
    id: 'data',
    title: '2. Categories of Personal Data We Collect',
    blocks: [
      {
        type: 'p',
        text: 'We only collect personal data that is necessary for providing and improving the Service. The categories of personal data we process include:'
      },
      {
        type: 'ul',
        items: [
          'Account Data: When you register or maintain an account, we collect information like your email address, display name/username, password hash (we store passwords securely in hashed form), and any profile information you choose to provide (such as profile biography, avatar image, links to your social media). We also store your user settings and preferences.',
          'User Content: We process the content you create on {SITE}, which may include posts (artworks, text descriptions), images, videos, audio files, comments you make, likes/favorites, reports you file, collections or folders you organize, and any other material you submit. If you add optional profile features such as background music or gallery descriptions, we will handle the data needed for those features as well. **Important:** Some content you provide might include personal data if you include it (e.g., if you upload a photo of yourself or tag someone). Content you post is generally public or shared with other users by default, so **do not include information you consider private in content** postings.',
          'Direct Messages and Communications: If the Service offers direct messaging (private messages between users), those messages are stored and processed to deliver them to recipients. Note that even though DMs are private between the participants, we as the service provider may access them under specific circumstances (for instance, for safety/moderation if a report is made, or as required by law). We also collect any communications you send to us, such as support tickets, emails, or abuse reports, and our communications with you (like responses from support). These may contain personal data like your email address and the content of your correspondence.',
          { text: 'Usage Data & Technical Information: When you use RabbitHole, our systems automatically record some technical information, such as:', items: [
            'IP Address: Used for security (e.g., identifying abusive behavior, preventing unauthorized access) and to infer your general location (at the city/region level) for features or legal compliance (like showing site content appropriate for your region).',
            'Device and Browser Data: This includes information like your device type, operating system version, browser type, and screen size. We use this to ensure compatibility and optimize the user experience.',
            'Identifiers: If you use our mobile app or website, we may assign an internal user ID. We also utilize cookies or similar technologies to keep you logged in (session cookies) and to remember preferences. Some cookies or local storage identifiers might be used for analytics (with consent, where required).',
            'Logs and Interaction Data: We keep logs of certain user actions for security and troubleshooting – for example, login timestamps, features used, content viewed, clicks, and referral URLs (which site/page led you to {SITE}). We also log crashes or error reports from the app to diagnose issues.'
          ]},
          'Billing Information: If you purchase a premium subscription or conduct any financial transaction on {SITE}, we (via our payment processor) will collect billing data. This includes your subscription status (active, canceled, trial), what plan you purchased, and an identifier from the payment processor (like a Stripe customer ID, payment method ID, or transaction IDs). **We do not store full credit card numbers or payment account details** on our servers; those are handled by the payment provider. We may store the last four digits of your card or the card’s expiration and the billing name/address if provided for invoicing, as part of the receipts/invoice records.',
          'Moderation and Safety Data: We maintain records related to moderation of the platform. This can include things like: reports submitted by users about content or behavior, our notes or decisions on those reports, records of rule violations, and any actions taken (warnings, suspensions, content removals). We also keep abuse prevention data such as login attempt records, accounts flagged for spam or fraud, and similar diagnostic data.',
          'Optional Data from Third-Party Logins: If in future we allow sign-in via third-party services (e.g., Google, Facebook, or others), and you choose to use that, we would receive basic account information from that third party (for example, an OAuth token, your email, and name as per that service). We will inform you at that time what data is obtained from the third-party login. (Currently, we primarily use our own sign-up system.)'
        ],
      },
      {
        type: 'p',
        text: 'We do **not** intentionally collect any **special categories of personal data** (such as information about health, political opinions, etc.) unless you voluntarily provide it (for instance, if you include sensitive personal details in a profile bio or in your art content, which we discourage). We also do not knowingly collect personal data from children under the digital consent age (see Section 11).'
      }
    ],
  },
  {
    id: 'sources',
    title: '3. Sources of Personal Data',
    blocks: [
      {
        type: 'p',
        text: 'We collect personal data from a few different sources:'
      },
      {
        type: 'ul',
        items: [
          'Directly from You: The majority of data comes from you directly. This includes data you provide when registering (e.g., email), filling out your profile, posting content, or contacting support. You have control over how much information to provide in these cases (beyond what’s necessary for registration/login).',
          'Generated by Your Activity: Data is also generated automatically as you use the Service. For example, as mentioned under Usage Data, we log interactions and technical data (IP address, device info, etc.) when you access {SITE}. Also, your content postings, messages, and interactions (likes, follows) generate data about your activities on the platform.',
          {
            text: 'Third Parties: We may receive some data from third parties in specific scenarios:',
            items: [
              'If you make a payment, our payment processor (e.g., Stripe) might send us confirmation of payment and basic details needed to record the transaction (as described in **Billing Information** above).',
              'If we implement third-party login, we get info from those providers as you authorize.',
              'If another user interacts with you (for example, if someone mentions you in a comment or sends you a message), we collect that information as part of running the Service.',
              'In future, if we enable social features or importing content from other platforms (with your consent), we would receive data from those external sources as needed.'
            ]
          },
          'Publicly Available Sources: We generally do not collect data from public databases about our users. However, if for example we needed to verify something in a fraud prevention context, we might use public resources or blacklists (e.g., checking if an IP is on a public spam list) – but such checks are limited and primarily for security.',
        ],
      },
    ],
  },
  {
    id: 'purposes',
    title: '4. Purposes of Processing & Legal Bases (Why We Use Your Data)',
    blocks: [
      {
        type: 'p',
        text: 'Under GDPR, we must have a valid **legal basis** for each purpose for which we process your personal data. We outline these below:'
      },
      {
        type: 'ul',
        items: [
          'Provide and Maintain the Service (Contractual Necessity – GDPR Art. 6(1)(b)): We use account data, user content, and technical data to operate RabbitHole and provide you with the services you expect. This includes hosting your posts and images, displaying content to you and others, enabling interactions (comments, likes), and maintaining your account settings. If you have a paid subscription, we process your data to give you the features you paid for. These uses are necessary to perform our contract with you (i.e., the Terms of Service, which you agree to by using {SITE}).',
          'Premium Billing & Subscription Management (Contract and Legal Obligation – GDPR Art. 6(1)(b) & 6(1)(c)): To process payments and manage subscriptions, we handle billing info and use third-party payment processors. This is part of providing the service you request (contractual). Additionally, we have legal obligations to keep transaction records for accounting and tax compliance, especially since our company operates in Poland/EU (e.g., VAT regulations, accounting laws requiring retention of invoices).',
          'User Communications & Support (Contractual and Legitimate Interest – Art. 6(1)(b) & 6(1)(f)): If you contact us for support or with a complaint, we use your contact info and communication to respond to you and resolve issues. It’s necessary for providing customer service (and thus part of our service contract to you), and also in our legitimate interest to maintain good user relations and resolve disputes.',
          'Service Communications (Contractual or Legal Obligation – Art. 6(1)(b) & (c)): We may send you emails or notifications about important service updates: for example, confirming your email or payment, receipts for purchases, critical changes to terms or policies, security alerts, or moderation actions taken on your account. These are necessary for your use of the service or required by law. For instance, if we change our Terms, we might be legally required to notify you. These types of communications are not marketing; you cannot opt out of receiving critical service notices as long as you have an account, except by deleting your account.',
          'Security and Abuse Prevention (Legitimate Interests – Art. 6(1)(f)): We process certain data to keep {SITE} and its users safe. This includes using IP addresses and logs to detect and mitigate fraudulent or malicious activities (like detecting multiple accounts for spam, or DDOS protection), using cookies or other measures for rate-limiting requests, and analyzing logs or user reports to prevent harassment or illegal content. It is in our legitimate interest (and that of our users) to ensure the security of the Service and prevent misuse. We carefully balance this with your rights – for example, security logs are accessed only by authorized personnel and retained only as long as needed for safety purposes (see Retention).',
          'Product Analytics (Legitimate Interests / Consent – Art. 6(1)(f) or Art. 6(1)(a)): We want to understand how users use {SITE} in order to improve the product. We may use privacy-friendly analytics tools that collect minimal personal data. For example, we might track how often certain features are used or the general geographic distribution of our users. If these analytics involve setting non-essential cookies or similar identifiers, we will seek your consent where required by law (e.g., under EU ePrivacy rules, analytics cookies are not set without consent unless strictly necessary). Our legitimate interest is to improve our service, but we will respect your choice if you opt-out of analytics tracking that is not strictly necessary.',
          'Marketing Communications (Consent – Art. 6(1)(a)): If you explicitly opt in to receive marketing emails or newsletters (for example, an email newsletter about {SITE} updates, or notifications about new features and promotions), we will use your email to send you such communications. You can withdraw your consent at any time by unsubscribing (every marketing email will have an “unsubscribe” link) or by adjusting your account email preferences. We will not send you marketing messages without your consent, especially if local law (like ePrivacy Directive implementations) requires opt-in.',
          'Content Ranking and Personalization (Legitimate Interests – Art. 6(1)(f)): We may use algorithms to personalize your experience – for instance, to sort your feed of followed artists, or recommend posts you might like. This involves processing data about your usage (which artists you follow, what you liked, etc.). We have a legitimate interest in helping users discover relevant content and keep the platform engaging. However, these processes **do not produce legal or similarly significant effects** on you – they are simply to enhance your content consumption experience (see Section 5 on Automated Decisions for more detail).',
          'Compliance with Legal Obligations (Legal Obligation – Art. 6(1)(c)): We might process and disclose personal data where necessary to comply with **laws or regulations**. For example, to respond to lawful requests by public authorities, to comply with tax and accounting laws, or to fulfill transparency obligations under the Digital Services Act (e.g., reporting the number of content removal orders we receive). If we receive a court order or similar legal demand for user information, we may need to process and share some data as required by law.',
          'Legal Claims & Enforcement (Legitimate Interests – Art. 6(1)(f)): If we need to establish, exercise, or defend against legal claims, we may process relevant personal data. For instance, keeping logs and records might be necessary to handle a dispute with a user or a third party. It’s in our legitimate interest to defend our legal rights and ensure our terms are enforced.'
        ],
      },
      {
        type: 'p',
        text: 'Whenever we rely on **legitimate interests** as a basis, we ensure that our interests are not overridden by your privacy rights by conducting balancing tests. You have the right to object to processing based on legitimate interests (see Section 9 on your GDPR rights).'
      }
    ],
  },
  {
    id: 'automated',
    title: '5. Automated Decisions & Profiling',
    blocks: [
      {
        type: 'p',
        text:
          '{SITE} uses some automated processes to provide and secure the service, but **we do not use automated decision-making that produces legal effects or similarly significant effects on you without human involvement** (as per GDPR Art. 22).',
      },
      {
        type: 'ul',
        items: [
          'Content Feeds and Recommendations: We may automatically rank or recommend content (for example, showing you popular posts, or ordering your home feed by an algorithm rather than strictly chronologically). These algorithms could be based on factors like content popularity, your past interactions, or quality and safety signals. **These automated decisions do not have a significant adverse effect on you** – they are meant to enhance your experience. You always have the option to sort content chronologically (if the feature is available) or opt out of certain personalized features. We aim to be transparent about the main parameters of any recommendation system in our user-facing help documentation.',
          'Spam/Abuse Detection: We use automated filters to detect spam (e.g., mass posting of the same comment) or certain rule-violating content (for example, known hash databases to detect child sexual abuse imagery, or algorithms that flag possible hate speech or AI-generated content). These tools may sometimes automatically prevent content from being posted or hide it pending review. However, final decisions (like permanently removing content or banning a user) are made with human review, especially for borderline cases. Our automated tools are there to assist human moderators and to **keep the community safe**, not to make irrevocable decisions on their own.',
          'Profiling: “Profiling” under GDPR means analyzing personal data to evaluate certain things about a person (like interests or behavior). {SITE} might do limited profiling for purposes like recommending content or showing relevant artists to follow. For example, if you frequently like digital paintings, the system might suggest more digital painters to you. This kind of profiling is common in social media for personalization. You can influence it by your actions (and you can opt out of marketing profiling by not opting into marketing communications). We do not use profiling to make decisions that significantly affect your rights or that are discriminatory or sensitive.',
          'No Automated Legal Decisions: We do not, for instance, automatically terminate accounts or refuse service solely by an algorithm. Any such serious action involves human involvement and review of the context.',
          'Transparency: We will update you if we introduce any new automated decision systems that go beyond the scope described here, and if required, we will provide means for you to request human intervention or express your point of view.'
        ]
      }
    ],
  },
  {
    id: 'recipients',
    title: '6. Recipients of Personal Data (Who We Share Data With)',
    blocks: [
      {
        type: 'p',
        text: 'We treat your personal data with care and do not sell it. However, we do share data in certain scenarios to run the Service effectively or when required by law:'
      },
      {
        type: 'ul',
        items: [
          {
            text: 'Service Providers (Processors): We use trusted third-party companies to help us operate {SITE}. These providers process data on our behalf and are bound by contractual obligations under GDPR (Data Processing Agreements) to protect your information. Key processors include:',
            items: [
              'Hosting and Infrastructure: Cloud service providers that host our servers and databases, and Content Delivery Networks (CDNs) that distribute images and media globally. (For example, we might use a provider like Amazon Web Services, Google Cloud, or a European hosting company. The provider will have access to stored data for maintenance but cannot use it for any other purpose.)',
              'Payment Processor: Stripe (or a similar payment platform) for handling subscriptions and payments. Stripe will receive your payment details and process transactions. We share with Stripe the necessary personal data for billing (such as your email, country, and payment info). Stripe is a PCI-DSS compliant entity and does not share your full card number with us.',
              'Email Service: If we send emails (verification, notifications, newsletters), we might use an email delivery service (like SendGrid, Mailgun, or similar) which will process your email address and the content of the email.',
              'Analytics and Logging: We might use services for analytics (like a self-hosted Matomo, or a privacy-friendly analytics service) and error tracking (like Sentry for crash reports). These may receive technical data (app errors, usage stats) but are generally configured without personal user identifiers whenever possible.',
              'Moderation Tools: We could employ third-party tools for content moderation assistance – for example, automated image scanning for disallowed content, or text filters. These tools would process content and flag issues, but typically do not retain the data and only provide us alerts.',
              'Other Processors: If we use other specialized services (e.g., a customer support ticketing system, or data backup storage), those providers might have incidental access to data. In all cases, processors are only allowed to use data as needed to provide their service to us and not for their own purposes.'
            ]
          },
          'Other Users and Public: A core aspect of {SITE} is sharing your content with others. Any **User Content** you post (art, comments, profile information) is visible to other users or the public according to the privacy settings of the platform. By default, art posts and comments are public to the community; your profile is public (unless we add settings to make certain fields private). Please be mindful that any information you share publicly can be viewed, saved, or shared by others (even after you remove it, others might have taken screenshots or re-shared it). We cannot control what other users do with information you make public.',
          {
            text: 'Legal and Law Enforcement: We may disclose personal data to third parties **when required by law or necessary to protect rights**. This includes:',
            items: [
              'Responding to lawful requests by public authorities, law enforcement, or courts. For example, if we receive a court order or a subpoena demanding certain user data, we will comply after verifying its validity. We will attempt to notify affected users if allowed (and if we have contact info), unless legally prohibited.',
              'Sharing information to comply with applicable laws or regulations (e.g., filing required data with tax authorities for purchase records).',
              'If necessary to enforce our [Terms of Service](/legal/terms) or to protect the rights, property, or safety of {SITE}, our users, or the public. For instance, exchanging information with other companies and organizations for fraud protection or to report a credible threat.'
            ]
          },
          'Business Transfers: If {COMPANY} is involved in a merger, acquisition, investment, reorganization, or sale of all or some of its assets, personal data may be transferred to the acquiring entity or merged with the successor’s data holdings. We will ensure the new owner has to respect your personal data in a manner consistent with this Privacy Policy. We will notify users (e.g., via email or a notice on the site) of any ownership change or data transfer along with any choices you may have.',
          {
            text: 'Independent Third-Party Services: Some third parties are not our “processors” but rather independent controllers of data you provide through our Service. For example:',
            items: [
              'If you link your {SITE} profile to another service (say, you add a link to your Twitter or YouTube), those services might collect data through that link if clicked (their own cookies, etc.).',
              'If in the future we support integration like sharing posts to other platforms or using a music API for profile songs, those external services might collect usage data when you interact with the integration. In such cases, your data is handled according to the third party’s terms, and we’ll only share data with those services at your direction (e.g., if you choose to connect accounts or share something).'
            ]
          },
          'Aggregated or Anonymized Data: We may share aggregated information that does not identify you personally, for purposes like industry analysis, demographic profiling, or to show trends about our user base. For example, we might publish that “X% of {SITE} users are from Europe” or “We have N monthly active users,” without revealing personal details.'
        ],
      },
      {
        type: 'p',
        text: 'We do not sell your personal data to any third-party for marketing or other purposes.'
      }
    ],
  },
  {
    id: 'transfers',
    title: '7. International Transfers of Data',
    blocks: [
      {
        type: 'p',
        text: '{SITE} is operated from Poland, and we aim to store user data primarily on servers located in the European Economic Area (EEA). However, some of our service providers or content delivery networks may process data in other countries (for example, a CDN node that delivers images might be outside the EU to speed up access for users in that region).',
      },
      {
        type: 'p',
        text: '',
      },
      {
        type: 'p',
        text: 'When personal data is transferred outside the EEA (or the United Kingdom, if UK data is involved) to a country that the European Commission has not deemed to have an “adequate” level of data protection, we will ensure appropriate **safeguards** are in place:',
      },
      {
        type: 'ul',
        items: [
          'We typically use **European Commission-approved Standard Contractual Clauses (SCCs)** in contracts with such service providers, which legally oblige them to protect your data to EU standards.',
          'Where needed, we assess whether additional technical or contractual measures are required (following guidelines from EU authorities, e.g., encryption in transit and at rest, commitments to handle government data requests carefully, etc.).',
          'Some providers may rely on schemes like the EU-US Data Privacy Framework (if applicable and the provider is certified under it) or other legally recognized transfer mechanisms.',
          'You can contact us if you would like more information on the specific safeguards for transfers pertaining to your personal data or to request a copy of relevant contract terms (we may redact commercial terms).'
        ]
      },
      {
        type: 'p',
        text: 'By using {SITE}, you understand that your personal data might be transferred to and processed in countries outside your own. Regardless of where data is processed, we take steps to ensure that your privacy rights continue to be protected as outlined in this policy.',
      },
    ],
  },
  {
    id: 'retention',
    title: '8. Data Retention (How long we keep your data)',
    blocks: [
      {
        type: 'p',
        text: 'We retain personal data only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention is required or permitted by law. In practice, this means:',
      },
      {
        type: 'ul',
        items: [
          'Account Data: We keep your account information while your account is active. If you delete your account or if we close it, we will delete or anonymize your personal data within a reasonable period after account deletion. Inactive accounts may also be deleted after a very long period of dormancy (we would provide notice before this). Some minimal information may be kept to prevent fraud or if required for legal obligations (see below).',
          'User Content: Content you post is stored until you remove it or your account is deleted. If you delete specific content (e.g., delete a post or comment), it will no longer be visible to others, and we will purge it from our live databases. However, it may remain in **backup systems or caches** for a short duration. Those backups are cycled and older data is overwritten or deleted periodically. If content was subject to a report and a moderation decision, we might retain a record of the content (e.g., in a takedown log) for evidence, even if it’s no longer visible on the site.',
          'Direct Messages: If implemented, private messages might be retained until you delete them. If you delete a message or conversation, it will be deleted from our active systems, but could exist in backups for a time. Note that the person you communicated with will still have their copy of the messages unless they also delete it.',
          'Logs & Technical Data: Security logs (like records of IP addresses used to log in, or logs of actions taken) are typically retained for a limited time, such as **30 to 180 days**, unless longer retention is justified for security analysis. For example, logs that show a pattern of abuse might be kept longer to track recurrences. General web server logs might be kept around 30 days by default. Analytics data may be retained in aggregate form (without personal identifiers) for a longer period to identify long-term trends.',
          'Billing Records: We retain financial transaction records as required by law. In Poland and under many tax laws, invoices and related records must be kept for a certain number of years (often **5 years** or more from the end of the tax year). Therefore, even if you delete your account, we might need to keep invoice data (which could include your name, email, and transaction details) for the legally mandated period. These will be stored securely and only used for those compliance purposes.',
          'Support Communications: Emails or support tickets are typically retained for some years, so we have a history of what was communicated in case of follow-ups. If you want us to delete a support email that contains your personal data, you can request it, though we might redact personal data instead if we need to keep the core message for record-keeping.',
          'Moderation Records: If you were involved in a violation of our Terms, we may keep records of the incident (including reports and our responses) for a duration that helps us identify repeat offenders or to have context for any future issues. Typically, if an account is terminated, we might keep such data for a couple of years in case of appeals or attempts to rejoin, or as required to demonstrate our compliance with legal obligations (like the Digital Services Act’s requirement to handle illegal content).',
          'Anonymized Data: In some cases, rather than full deletion, we might anonymize data (so it can no longer be linked to you). For example, instead of deleting an entire analytics log entry, we might remove personal identifiers and keep aggregated info like “a user from X country did Y” that is no longer tied to any specific account.'
        ],
      },
      {
        type: 'p',
        text: 'When we no longer have a legitimate need to retain your personal data, we will ensure it is either securely deleted or anonymized.',
      },
    ],
  },
  {
    id: 'rights',
    title: '9. Your Rights under GDPR',
    blocks: [
      {
        type: 'p',
        text: 'As an individual in the European Union (or where GDPR applies), you have the following rights regarding your personal data that we hold:',
      },
      {
        type: 'ul',
        items: [
          'Right of Access: You have the right to request a copy of the personal data we hold about you, as well as information on how we process it. This is commonly known as a “Data Subject Access Request.” We will provide you with a copy of your data, usually within one month of verification of your identity (an extension is possible for complex requests, but we will inform you if that’s the case).',
          'Right to Rectification: If any of your personal data is inaccurate or incomplete, you have the right to request that we correct or update it. You can also correct some of your data directly through your account settings (e.g., you can change your display name or email).',
          'Right to Erasure (“Right to be Forgotten”): You have the right to request deletion of your personal data. This is not absolute – for example, if we have a legal obligation to keep certain data, we may deny the request for those specific pieces. However, we will honor deletion requests for data we no longer need. The easiest way to exercise this for most of your data is to delete your account through the settings, which removes personal info and content (subject to the retention policy above). If you want a specific piece of data deleted, you can ask us. We will also inform other parties to whom we’ve disclosed the data (if any, and if required by law) about your deletion request.',
          'Right to Restriction of Processing: You can ask us to restrict (pause) the processing of your data in certain circumstances. For example, if you contest the accuracy of data, you can request we restrict processing until we verify the accuracy; or if you object to our legitimate interest processing, you can request restriction while we consider your objection.',
          'Right to Object: You have the right to object to certain processing activities. In particular, you can object to processing based on legitimate interests. If you do, we must stop unless we have compelling legitimate grounds that override your rights or if we need to continue for legal claims. You also have an absolute right to object to your personal data being used for direct marketing purposes – if we were doing marketing, we would stop if you object or withdraw consent.',
          'Right to Data Portability: For data that you provided to us and that we process by automated means on the basis of your consent or a contract, you have the right to request a copy in a **structured, commonly used, machine-readable format** (for example, JSON or CSV file). You also have the right to ask that we transmit that data to another service where technically feasible. In practice, this applies to things like the content you posted or info you gave us, not to things we generated (like internal analytics). We are exploring tools to allow you to export your content easily.',
          'Right not to be subject to Automated Decision-Making: As noted, we do not subject you to decisions with legal or similar effects without human involvement. If you believe a purely automated decision is affecting you significantly, you can request human review.',
          'Withdrawal of Consent: If we rely on your consent for any processing (e.g., for sending marketing emails), you can withdraw that consent at any time. Withdrawing consent does not affect the lawfulness of processing based on consent before its withdrawal. For example, you can unsubscribe from marketing emails, and we will stop sending them.',
          'How to Exercise Your Rights: To exercise any of your rights, please contact us at [CONTACT_EMAIL](mailto:{CONTACT_EMAIL}). Please clearly state what you are requesting. We may need to verify your identity before fulfilling the request (for instance, by confirming you have access to the email associated with your account, or asking for some identifying info).',
          'Response Time: We will respond to requests within **one month**. If your request is complex or if we receive many requests, we may extend this by up to two further months, but we will inform you within the first month if an extension is needed and why.',
          'Fees: In general, we will not charge a fee for exercising your rights. However, if a request is manifestly unfounded or excessive (for example, repetitive requests), we may either charge a reasonable fee or refuse to act on the request (per GDPR rules). We will explain our reasoning in such cases.'
        ],
      },
      {
        type: 'p',
        text: 'Please note that these rights may be subject to certain exemptions under applicable law. For instance, if fulfilling your request would adversely affect others’ rights or if we have to keep data for legal reasons, we might not be able to comply fully, but we will explain the situation to you.',
      },
    ],
  },
  {
    id: 'cookies',
    title: '10. Cookies & Similar Technologies',
    blocks: [
      {
        type: 'p',
        text: '{SITE} uses cookies and similar technologies to provide and improve the Service. When you visit our website or use the app, we may place some cookies on your browser or device. Here’s an overview:',
      },
      {
        type: 'ul',
        items: [
          'Strictly Necessary Cookies: These cookies are essential for the Service to function. For example, they include login/session cookies that keep you logged in as you navigate the site, or preferences cookies that remember your settings (like language or theme). These do not require consent as they are necessary for providing the service you requested.',
          'Analytics Cookies: We may use cookies or local storage to understand how users engage with {SITE} (e.g., which pages are popular, how users navigate). We use analytics in a privacy-respecting way – possibly first-party only or via a tool that doesn’t profile users across sites. If these cookies are not strictly necessary, we will ask for your consent before setting them. You might see a cookie banner or settings when you first use the site, allowing you to accept or reject non-essential cookies.',
          'Third-Party Cookies: At present, {SITE} aims to minimize third-party tracking. We do not serve third-party ads that track you, and we don’t use social media “like” buttons that set their own cookies (unless we explicitly inform you). However, if we embed content from third-party sites (like a YouTube video or similar), those third parties might set cookies. We will endeavor to use “privacy-enhanced” modes if available (for example, YouTube’s nocookie domain).',
          'Cookie Choices: You can control cookies through your browser settings (e.g., blocking or deleting cookies) and through any consent banner we provide. Note that blocking cookies might affect the functionality of {SITE} – for example, you might not be able to log in or maintain a session without the necessary cookies.',
          'Other Technologies: We might use local storage or similar on devices for certain features (functionally similar to cookies). We might also use “pixels” or image tags in emails to know if you opened an email (helps us gauge interest, etc.), but these are primarily for operational emails; marketing emails will include such tracking only if allowed by law and with your consent to receive them.',
          'Do-Not-Track: Currently, our Service may not respond to “DNT” headers sent by browsers, because there is no consensus on what that means. We instead provide you direct control via our cookie consent and settings.',
          'For more detailed information on cookies, we will maintain a cookie policy or list in our Help Center where you can see exactly which cookies we use and their purposes.'
        ],
      },
    ],
  },
  {
    id: 'children',
    title: '11. Children’s Privacy',
    blocks: [
      {
        type: 'p',
        text: '{SITE} is **not directed to children under the age of digital consent** in their jurisdiction. In most EU countries, this means the Service is not intended for children under **16 years of age** (in some countries this threshold may be lower, but {SITE} has chosen 16 as a general rule, given Poland’s stance). We do not knowingly collect personal data from children under 16 without verifiable parental consent.'
      },
      {
        type: 'ul',
        items: [
          'If you are under 16: Please do not register or use {SITE} without parental permission. If we learn that we have collected personal data from a child under 16 without consent, we will take steps to delete that information.',
          'Parental Consent: If in the future certain features are made available to younger teens (for example, if we allow 13+ with parental consent in a jurisdiction that allows it), we will implement mechanisms to obtain and verify parental consent as required by law. At this time, we prefer to restrict the platform to users 16 and older.',
          'Note on NSFW Content: Because the Service may contain adult content (behind warnings/tags), it is especially not appropriate for children. We have systems in place to try to prevent underage users from accessing mature content (such as requiring age confirmation for certain actions or filtering content), but these are not foolproof. The primary measure is that underage users should not be on the platform.',
          'If you are a parent or guardian and discover that your child under 16 has an account on {SITE}, you can contact us at [CONTACT_EMAIL](mailto:{CONTACT_EMAIL}) and we will address it (including deleting the account and any associated data, as appropriate).'
        ]
      }
    ],
  },
  {
    id: 'security',
    title: '12. Security Measures',
    blocks: [
      {
        type: 'p',
        text: 'We take the security of your personal data seriously and implement **technical and organizational measures** to protect it against unauthorized access, alteration, disclosure, or destruction. These measures include:'
      },
      {
        type: 'ul',
        items: [
          'Encryption: We use encryption to protect data in transit (HTTPS/TLS encryption on our website and app APIs, so that data transmitted between your device and our servers is encrypted). We also encrypt sensitive data at rest where appropriate (for example, passwords are stored as secure hashes, not plaintext).',
          'Access Controls: Only authorized personnel and contractors have access to personal data, and only on a need-to-know basis. We employ access control mechanisms such as authentication, role-based access, and key management to ensure only the right people and services can access data.',
          'Secure Development Practices: Our development process incorporates security reviews and testing. We keep our software and dependencies up-to-date to patch vulnerabilities. We may engage in periodic security audits or penetration testing by third parties.',
          'Network & Infrastructure Security: We use firewalls and monitoring to protect our network. Suspicious activity or repeated failed login attempts might trigger security measures (like IP blocking or additional verification).',
          'Backup and Recovery: We perform regular backups of data to prevent loss. Backups are secured and encrypted. We have disaster recovery plans to restore service in case of a major incident.',
          'Vulnerability Management: We actively monitor for vulnerabilities in our systems and respond promptly to security advisories. If an incident occurs that affects security, we will notify users and authorities as required by law (for example, GDPR’s breach notification requirements for serious breaches).',
          'User Responsibilities: It’s important to note that you also play a role in security. Choose a strong, unique password for {SITE} and do not share it. Be cautious of phishing attempts – {SITE} will never ask you for your password via email. If you enable two-factor authentication (2FA) when we offer it, that will add an extra layer of security to your account.',
          'Incident Reporting: If you discover any security vulnerabilities or have security concerns, please report them to us at [CONTACT_EMAIL](mailto:{CONTACT_EMAIL}). We appreciate the help of security researchers and will act promptly to investigate any reported issues.'
        ],
      },
      {
        type: 'p',
        text: 'No system is 100% secure, but we strive to protect your data. In the unfortunate event of a data breach that poses significant risks to your rights (such as identity theft or fraud), we will inform both you and the relevant supervisory authority (like the Polish **UODO**) in accordance with GDPR requirements.'
      },
    ],
  },
  {
    id: 'complaints',
    title: '13. Complaints and Dispute Resolution',
    blocks: [
      {
        type: 'p',
        text: 'We hope to resolve any privacy concerns you have directly. You can always reach out to us at [CONTACT_EMAIL](mailto:{CONTACT_EMAIL}), and we will do our best to address your issue or query.'
      },
      {
        type: 'p',
        text: 'If you are in the EU/EEA and believe we have infringed your data protection rights, you also have the right to lodge a complaint with a **supervisory authority** (data protection regulator). Since our main establishment is in Poland, our lead supervisory authority is:'
      },
      {
        type: 'p',
        text: '**President of the Personal Data Protection Office (UODO)**'
      },
      {
        type: 'p',
        text: '{ADDRESS}'
      },
      {
        type: 'p',
        text: 'Website: [https://uodo.gov.pl](https://uodo.gov.pl) (includes contact information and guidance on how to submit a complaint)'
      },
      {
        type: 'p',
        text: 'If you reside in another EU country, you may contact your local data protection authority. They will coordinate with UODO under the cooperation mechanism of GDPR. A list of authorities can be found on the European Data Protection Board website or via the EU Commission’s site.'
      },
      {
        type: 'p',
        text: 'We would, however, appreciate the chance to deal with your concerns before you approach a regulator or courts, so please consider reaching out to us first.'
      },
    ],
  },
  {
    id: 'changes',
    title: '14. Changes to this Privacy Policy',
    blocks: [
      {
        type: 'p',
        text: 'We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or for other operational reasons.'
      },
      {
        type: 'ul',
        items: [
          'Notification of Changes: If we make material changes (those that significantly affect how your personal data is processed), we will notify you in advance. We may notify you by email (sent to the address associated with your account) or by posting a prominent notice on our website or within the app. For significant changes, we will provide at least a **15-day notice** when possible, so you can review the changes. Minor changes (like clarifications, or typographical corrections) may take effect immediately, with the updated Policy posted on the site.',
          'Reviewing Changes: We encourage you to periodically review this Privacy Policy to stay informed about how we are protecting your information. The “Effective Date” at the top indicates when the latest changes were made.',
          'Consent to Changes: If you continue to use {SITE} after those changes go into effect, you will be considered to have agreed to the updated policy. If you do not agree with the changes, you should discontinue use of the Service and you may request us to delete your data.',
          'Historical Versions: For transparency, we keep archives of previous versions of this Privacy Policy. You can request a copy of earlier versions by contacting us, or we may provide a change log summarizing updates.'
        ]
      },
      {
        type: 'p',
        text: '*By using {SITE}, you acknowledge that you have read and understood this Privacy Policy and our* [Terms of Service](/legal/terms). *We thank you for entrusting us with your art and personal data, and we commit to handling it with care and respect*.'
      },
    ],
  },
];

// ---------------------- Terms ----------------------

export const TERMS_SECTIONS = [
  { id: 'acceptance', title: 'Acceptance' },
  { id: 'eligibility', title: 'Eligibility' },
  { id: 'service', title: 'Service' },
  { id: 'content', title: 'Content & License' },
  { id: 'conduct', title: 'Conduct' },
  { id: 'moderation', title: 'Moderation (DSA)' },
  { id: 'ip', title: 'IP & Notices' },
  { id: 'privacy', title: 'Privacy' },
  { id: 'premium', title: 'Premium' },
  { id: 'payments', title: 'Payments' },
  { id: 'thirdparty', title: 'Third-party' },
  { id: 'warranty', title: 'Disclaimers' },
  { id: 'liability', title: 'Liability' },
  { id: 'law', title: 'Law & ODR' },
  { id: 'changes', title: 'Changes' },
  { id: 'contact', title: 'Contact' },
];

export const TERMS_CONTENT: Array<
  { id: string; title: string; blocks: Array<ContentBlock> }
> = [
  {
    id: 'acceptance',
    title: '1. Acceptance & Definitions',
    blocks: [
      {
        type: 'p',
        text: 'By accessing or using **{SITE}** (the “Service”), you agree to these Terms of Service (“Terms”) and our Privacy Policy (which is incorporated by reference). **{SITE}** is operated by **{COMPANY}**\n("we", "us", "our"), a company registered in Poland with the KRS number {COMPANY_KRS} and the NIP number {COMPANY_NIP}\nIf you do not agree with these Terms, you must not use the Service.'
      },
      {
        type: 'p',
        text: ''
      },
      {
        type: 'p',
        text: '**Definitions**: In these Terms, "Content" refers to any text, images, audio, video, or other material that users post or share on the Service. "You" and "User" refer to the person using the Service.'
      },
    ],
  },
  {
    id: 'eligibility',
    title: '2. Eligibility & Accounts',
    blocks: [
      {
        type: 'ul',
        items: [
          'Legal Capacity: You must be able to form a binding contract under your local law to use the Service. If you are under the digital age of consent (16), you need parental or guardian consent to use {SITE}, and some features (especially those involving payments or NSFW content) may be restricted to adult users.',
          'Account Registration: When creating an account, you agree to provide truthful, accurate information. You are responsible for keeping your login credentials secure and for all activities under your account.',
          'Account Responsibility: You are responsible for any content or activity that occurs under your account. If you suspect unauthorized use of your account, notify us immediately at [CONTACT_EMAIL](mailto:{CONTACT_EMAIL}).',
          'Account Actions: We reserve the right to suspend or terminate your account for serious or repeated violations of these Terms, for security reasons, or as required by law. We will provide notice with the reasons for suspension or termination where possible (see Section 6 on Moderation).'
        ],
      },
    ],
  },
  {
    id: 'service',
    title: '3. Service Description & Availability',
    blocks: [
      {
        type: 'ul',
        items: [
          'Service Overview: {SITE} is a social platform and online gallery designed for artists to share and showcase artwork (including visual art, writing, audio, and other creative content), follow and discover other creators, and engage in community discussions. Features may include posting content, organizing content into folders or collections, commenting, favoriting/liking, and (if enabled) direct messaging between users.',
          'NSFW Content: The platform allows **NSFW (Not Safe For Work)** or adult-oriented artwork **only if** it is properly tagged or marked as such before uploading. You must follow our guidelines for content rating and tagging so that sensitive or adult content is appropriately filtered. Any sexually explicit or graphically violent content must be marked **“Mature” or “Adult”** according to our rating system to prevent exposure to minors or unwilling users. **Content involving illegal acts or any depiction of minors in sexual contexts is strictly forbidden.**',
          'AI-Generated Content: To support human artists, **AI-generated content** (art or media created or significantly modified by artificial intelligence or machine-learning algorithms) **is not allowed** on {SITE}. All artwork and media you post must be your own original creation or collaborative work with other humans. Content partially or wholly generated by AI (e.g. using tools like Midjourney, DALL-E, Stable Diffusion, etc.) is prohibited and may be removed. Repeated violations of this rule can result in account suspension or ban. (*Our goal is to keep the focus on art made by people, as many art communities have chosen to do*.)',
          'Future Features: {SITE} may introduce new features to support artists, such as direct messaging (DMs), commission/tipping systems, or creator shops for selling art/merch. These features may not be available at launch, and their availability can depend on development progress. When such features are introduced, additional terms or guidelines may apply (for example, rules for using the commission marketplace or tipping system, and integrations with payment providers). We will notify users and update these Terms or provide supplemental terms as necessary when new features go live.',
          'Service Availability: We strive to keep {SITE} available 24/7, but **no service can be guaranteed to be uninterrupted or error-free.** We may temporarily suspend access for maintenance, updates, or to resolve technical issues. We are not liable for any downtime or data loss, though we will make reasonable efforts to minimize disruptions. Some features may be limited or geo-restricted depending on legal requirements or regional availability.',
          'Modifications: The Service features may evolve over time. We may add, remove, or modify features (for example, to improve user safety, comply with legal requirements, or enhance performance). We will try to ensure that any changes do not reduce the core value of the Service for our users. If we make significant changes, we may inform you through in-app announcements or on our website.'
        ],
      },
    ],
  },
  {
    id: 'content',
    title: '4. Your Content & License',
    blocks: [
      {
        type: 'ul',
        items: [
          'Ownership: You retain full ownership of the Content that you create and post on {SITE}. Nothing in these Terms takes away your rights to your own artwork or other creations.',
          'License to RabbitHole: By submitting or posting Content on the Service, you grant us a worldwide, non-exclusive, royalty-free license to **use, host, store, reproduce, modify, adapt, publish, and display** your Content as necessary to operate, improve, and promote the Service. This includes actions like creating thumbnail images or lower-resolution versions for previews, transcoding or resizing content for optimal display, and content distribution via our content delivery networks (CDNs). **We do not claim ownership** of your Content, but this license permits us to showcase your work on {SITE} (for example, allowing other users to view it, or featuring it in site galleries or search results).',
          'Purpose of Use: The license to us also allows creation of non-identifying aggregate data (e.g. usage statistics that include your Content in an anonymized way) and inclusion of your Content in backups or archives of the Service. These are routine operations to ensure the Service functions reliably.',
          { text: 'Your Responsibilities for Content: You warrant that you have all necessary rights to the Content you upload. This means:', items: [
            'The Content is your original creation (or you have permission from the creator to post it, such as in a collaboration or commissioned work).',
            'Posting your Content on {SITE} does not infringe the intellectual property, privacy, publicity, or other rights of any third party. For example, you will not upload artwork that you copied or traced from someone else without permission, nor photos or videos of people without consent if required.',
            'The Content complies with these Terms (see Section 5 on prohibited content) and with applicable laws.'
          ]},
          'Commercial Use of Content: You are free to use your posted Content for any personal or commercial purposes outside our platform (for example, selling prints of your art, or using your art in commissions), provided that such activities do not violate any other part of these Terms or someone else\'s rights. {SITE} does not claim any ownership of your work, and our license to host your Content does not limit your ability to monetize your work elsewhere.',
          'Content Removal by You: You may delete or remove your Content from {SITE} at any time using the available tools (e.g., a delete post function). When you delete Content, it will become inaccessible to other users. However, you acknowledge that removed Content **might persist temporarily in backups, cached pages, or CDNs**. We will remove or anonymize such data from active systems within a reasonable timeframe, but we cannot guarantee immediate expungement from all archives.',
          'Content Removal/Restriction by Us: If any Content violates these Terms or applicable law, we may remove or restrict access to it. (See Section 6 on Moderation for how we handle this, including notice and appeals.) We may also terminate or suspend accounts that repeatedly infringe others’ intellectual property rights or repeatedly violate content rules.',
          'Feedback: If you provide us with suggestions or feedback on the Service, you agree we may use and implement those ideas without any compensation to you, and without any obligation to attribute them to you.'
        ],
      },
    ],
  },
  {
    id: 'conduct',
    title: '5. Prohibited Conduct & Content',
    blocks: [
      {
        type: 'p',
        text: 'You agree not to engage in any of the following when using {SITE}, and you will not post Content that falls into these prohibited categories. Violation of these rules can result in content removal, account suspension, or other actions:'
      },
      {
        type: 'ul',
        items: [
          'Illegal or Harmful Content: You may not post any content that is **illegal** under applicable law, or that encourages or depicts illegal activity. This includes (but is not limited to) content such as child sexual abuse material, bestiality, human trafficking, terrorism or violent extremist propaganda, or content that incites violence or hatred against any group. We have zero tolerance for such content.',
          'Infringing Content: Do not upload content that infringes someone else’s intellectual property rights or other rights. This means no unauthorised use of copyrighted material, trademarks, or stolen artwork. **Counterfeit goods or pirated content** are also prohibited. If you use reference images or other materials in your artwork, ensure you have the right to do so. (We comply with copyright takedown notices as described in Section 7.)',
          'Non-Consensual and Privacy-Violating Content: Absolutely no sharing of **non-consensual intimate imagery** (e.g., "revenge porn") or any content that violates another person’s privacy or personal rights. Doxxing (publishing someone’s private information without consent) and voyeuristic content taken/posted without consent are banned.',
          'Harassment & Hate: {SITE} is an artist community and we expect respectful conduct. Do not engage in targeted harassment, bullying, or threats against others. Content that promotes hate or discrimination against others based on protected characteristics (such as race, ethnicity, religion, gender, sexual orientation, disability, etc.) is strictly forbidden. You may express opinions and artistic commentary, but not in a manner that crosses into personal attacks or hate speech.',
          'Spam, Scams, and Malicious Activity: You may not use the Service for spamming (mass unsolicited communications), phishing, or scams. This includes posting deceptive links, fraudulent schemes, or advertisements for fake products/services. Do not distribute malware, viruses, or engage in activities like data scraping or automated account creation without authorization. Any attempts to overload or interfere with the normal functioning of the platform (e.g., via bots or scripts) are prohibited.',
          // TODO: nsfw tags do not requires for private accounts, to, kto ma dostęp do prywatnego konta i teści na nich odpowiada wyłacznie właścicel knota
          'Prohibited NSFW Content & Tagging Requirements: **Adult or mature content** (such as nudity or sexual content) **must be properly tagged and age-restricted** using our provided tools. Pornographic art or explicit sexual content is *allowed only* if it is tagged as NSFW/Mature and does not violate any law or any other rule (for example, it must involve only consenting adults, no depictions of minors, and no extremely obscene or illegal pornographic material). **Failure to tag NSFW content** appropriately (or deliberately mis-tagging/misrating content) is a violation of these Terms. Content featuring extreme violence or gore should likewise be tagged or marked with the highest appropriate content rating. We reserve the right to remove or re-classify content that is not properly labeled.',
          'No AI-Generated or Machine-Assisted Content: As noted in Section 3, {SITE} prohibits content created or significantly modified by generative AI tools. This includes images, text, audio, or videos wholly generated by AI, as well as pieces that are derivative of AI outputs (for example, painting over an AI-generated image). Our community is dedicated to human creativity, so **any AI-generated media will be removed** when identified, and users may face account action for posting such content. (*Note: This does not prevent you from discussing AI or posting news about AI in a textual format, but the platform is not a place to showcase AI-created art*.)',
          'Misrepresentation and Impersonation: Do not impersonate RabbitHole staff, other users, or public figures. Also, do not misrepresent the source or authorship of content (e.g., claiming someone else’s art as your own, or posing as another artist). Parody and satire are allowed, but must be clear and not used to deceive.',
          'Circumventing Safety Measures: You must not attempt to bypass or undermine the Service’s security and content moderation measures. This includes evading account suspensions by creating new accounts, using exploits to gain unauthorized access to data or features, or removing watermarks / safety labels on content. Any reverse engineering of our software or APIs is only allowed to the extent permitted by law (e.g., for interoperability); malicious attempts to hack or scrape our Service are prohibited.',
          'Audio Content Standards: (*If {SITE} allows audio on profiles or posts*), you must ensure any audio you upload (such as music on your profile) complies with volume and content standards. Extremely loud, distorted, or **harmful audio (“earrape”)** intended to shock or cause discomfort is not allowed and may be removed. Also ensure you have rights to any music or audio (no unlicensed commercial music).',
          'Additional Community Guidelines: We may publish more detailed community guidelines or content rules on specific topics (such as detailed NSFW content guidelines, AI content definitions, or etiquette rules). Those guidelines are incorporated into these Terms, and you agree to follow them. We will make those guidelines easily accessible (e.g., via the Help Center or a FAQ). If you violate any posted community guidelines, it’s considered a violation of these Terms.'
        ],
      },
    ],
  },
  {
    id: 'moderation',
    title: '6. Content Moderation (EU Digital Services Act)',
    blocks: [
      { type: 'p', text: 'We act as a **hosting service provider** under the EU Digital Services Act (Regulation (EU) 2022/2065). This means we generally do not actively monitor all user content, but we have mechanisms to address illegal content or Terms violations once we become aware. Our moderation approach includes:' },
      {
        type: 'ul',
        items: [
          'Notice and Action: If you find content that you believe is **illegal** or violates these Terms, you can report it to us. Use the in-app report function (if available) or email us at [CONTACT_EMAIL](mailto:{CONTACT_EMAIL}). Your notice should include a link/URL to the content, a description of why it’s illegal or against our rules, and any relevant context or law. We will promptly review such notices. If content is found to be in violation, we will act expeditiously to remove or disable access to it.',
          'Content Removal & Statement of Reasons: If we remove or restrict content that you have posted, we will inform you of the decision and give a brief **statement of reasons**, unless we are legally prevented from doing so or if notification would impede law enforcement. The statement of reasons will usually be provided via email or an in-app notification, and it will outline which rule or law was violated.',
          'Appeals: You have the right to **appeal** moderation decisions. We will provide an internal complaint-handling system (for example, a way to request review of a content removal or account suspension). Instructions for appeals will be provided in the statement of reasons or in our Help Center. When you appeal, please provide any relevant information or explanations. We will review appeals in a timely manner and can reinstate content or accounts if a mistake was made or upon successful remediation.',
          'Repeated or Egregious Violations: Users who **repeatedly or seriously** violate these Terms (for example, by posting illegal content or harassing others despite warnings) may be suspended or permanently banned from {SITE}. We may also take intermediate steps like temporary posting restrictions or requiring content removal. We aim to apply measures proportionally and fairly, considering the severity and frequency of violations.',
          'User Moderation Tools: We may introduce community moderation features (such as user flagging of content, or trusted reporters) to help identify content that may violate our policies. Abuse of reporting systems (e.g., false reports to harass someone) is itself a violation of these Terms.',
          'Transparency: In accordance with the DSA and our commitment to transparency, we may publish periodic reports or summaries about our content moderation (e.g., the number of content removal orders from authorities, number of user reports handled, etc.). These reports will be anonymized and not include personal data. We will also comply with any obligations to report significant systemic risks if {SITE} grows to a size covered by specific DSA provisions.',
          'Local Law Compliance: We will comply with orders from courts or relevant authorities regarding illegal content. If we receive a valid legal order (for example, from a court or regulator in an EU member state) to remove specific content, we will act accordingly and inform users when permitted.',
          'No Editorial Control: While we moderate for policy violations, we do not control or pre-approve what users post. The views expressed by users are their own. We are not liable for content posted by users, but once we are aware of illegal content, we will remove it promptly in line with EU law (Directive 2000/31/EC and the DSA’s notice-and-action framework).',
        ],
      },
    ],
  },
  {
    id: 'ip',
    title: '7. Intellectual Property & Notices',
    blocks: [
      {
        type: 'ul',
        items: [
          'Respect for IP: We respect intellectual property rights and expect you to do the same. Do not post content that you do not have the rights to use. This includes **copyrighted works, trademarks, or logos** of others used without permission. If you incorporate someone else’s work (like using a stock image or a piece of music in your video), you must have a license or the legal right to do so.',
          'Your IP Rights: On the flip side, you retain rights to content you create. If another user misuses your content or you believe your rights are being infringed on {SITE} by someone else’s content, you can notify us.',
          {text: 'Takedown Requests (Copyright/IP): If you believe that content on our Service infringes your copyright or other intellectual property rights, please send a detailed notice to [CONTACT_EMAIL](mailto:{CONTACT_EMAIL}). Your notice should include:', items: [
            'Identification of the work you claim is infringed (for example, a link to or description of your original artwork).',
            'Identification of the content on {SITE} that you want removed (please provide the specific URL or post link).',
            'A statement that you have a good-faith belief that the use of the material is not authorized by the rights owner, its agent, or the law.',
            'A statement that the information you provide is accurate, and that **under penalty of perjury** you are the rights owner or authorized to act on the owner’s behalf.',
            'Your contact information (name, address, email) and a physical or electronic signature.',
          ]},
          'Compliance with EU and DMCA: We are a Poland-based service and we comply with applicable EU copyright laws. Our takedown process is also informed by the principles of the U.S. Digital Millennium Copyright Act (DMCA) for the benefit of international users or rights holders. In other words, we will process legitimate IP takedown requests from anywhere. Where relevant, we will also process **counter-notices** if a user believes their content was wrongly removed for alleged infringement. Counter-notices should similarly contain sufficient information and a statement under penalty of perjury that the content was removed due to mistake or misidentification. We may forward valid notices to services like the Lumen Database (for transparency) after removing personal contact information.',
          'Repeat Infringers: According to our policy and legal requirements, accounts that are deemed **repeat infringers** (e.g., receiving multiple valid copyright complaints) may be terminated. We will notify users if their account is at risk of termination due to repeat infringement.',
          'Trademark & Others: If you have a trademark complaint or other intellectual property issue (besides copyright), you can also contact us at the same support email with relevant details. We will review and address such complaints as appropriate.'
        ],
      },
    ],
  },
  {
    id: 'privacy',
    title: '8. Privacy and Data Protection',
    blocks: [
      { type: 'p', text: 'Your use of {SITE} is also governed by our [Privacy Policy](/legal/privacy), which outlines how we collect, use, and protect your personal data. We adhere to the EU General Data Protection Regulation (GDPR) as our company is based in Poland. Some key points:' },
      {
        type: 'ul',
        items: [
          'We only use your data as permitted by law (for providing the service, legal compliance, etc., as detailed in the Privacy Policy).',
          'We implement appropriate security measures to protect your data (see Section 12 of the Privacy Policy for more on security).',
          'You have rights regarding your data, such as access, deletion, and objection, which we honor in accordance with EU law (see Privacy Policy Section 9 on user rights).',
          'By using the Service, you also agree that we can process your information in accordance with the [Privacy Policy](/legal/privacy). If you do not agree, you should not use {SITE}.',
        ],
      },
    ],
  },
  {
    id: 'premium',
    title: '9. Premium Services (Golden Carrot)',
    // TODO: make it for all users, not only EU
    blocks: [
      { type: 'p', text: '{SITE} may offer an optional **premium subscription** (provisionally called “**Golden Carrot**” or similar) which provides additional features or benefits for a fee. We provide the following consumer information in compliance with EU laws (e.g., Consumer Rights Directive):' },
      {
        type: 'ul',
        items: [
          'Nature of Service: The premium offering is a **digital service subscription**. Possible benefits may include things like exclusive content, enhanced profile features, higher upload limits, an ad-free experience, or other perks (we will specify the exact benefits at purchase).',
          'Subscription Term & Renewal: We may offer a monthly plan (auto-renewing every month until canceled) and/or an annual plan (either auto-renewing yearly or a fixed-term one-year access). The specific term will be shown at the time of purchase.',
          'Pricing and Taxes: Prices will be displayed in your local currency where possible. If applicable, prices will include VAT or other taxes, or we will clearly indicate if tax is added at checkout. For EU customers, VAT handling is in accordance with the law (either we remit VAT via our payment processor for each country or use the OSS scheme). Tax invoices or receipts can be provided (often via our processor, e.g., Stripe).',
          'Right of Withdrawal (Cancellation): If you are an EU consumer, you generally have a 14-day right of withdrawal for digital services purchased online. **However**, if you purchase a {SITE} premium subscription and **choose to start using it immediately**, you will be asked to **confirm that you waive the 14-day cancellation right** once the service has been fully delivered. This is because EU law allows digital services to be provided immediately if the consumer consents, but then you lose the right to withdraw (Article 16(m) of the Consumer Rights Directive). If you do not want to waive this right, you should wait 14 days to use the premium features or simply not subscribe until you’re sure.',
          {text: '**Cancellation and Refunds:**', items: [
            'Monthly subscriptions will continue until canceled. You can cancel any time, and your premium access will then last until the end of the current billing period (month). It will not renew after that',
            'Annual subscriptions are often sold at a discount and run for the fixed term; they generally **do not auto-renew** by default, or if they do, it will be clearly disclosed. If you cancel an annual subscription partway through, you typically retain premium access for the remainder of the term but **will not be charged further**.',
            'Outside of the initial 14-day period (if not waived), **refunds** are generally **not provided for partially used subscription periods**, unless required by law or exceptional circumstances. If there is a defect or serious issue with the premium service, contact support and we will address it in line with your statutory rights.'
          ]},
          'Feature Changes: We reserve the right to modify the specific benefits included in premium (for example, adjusting limits or adding/removing features) as the Service evolves. However, we will not materially degrade the overall value of the subscription that you have already paid for. If a change significantly reduces your benefits, we may offer alternatives or compensation (or you can choose to cancel). Any material changes will be communicated.',
          'Upgrades/Downgrades: If we offer different tiers of premium, you’ll have options to upgrade or downgrade. Upgrades might take effect immediately (with pro-rated pricing) while downgrades usually apply after the current billing period.'
        ],
      },
      { type: 'p', text: '(*This section is provided to ensure compliance with EU consumer protection laws. It gives you transparent information about any paid services, fulfilling requirements such as those in the Consumer Rights Directive.*)' },
    ],
  },
  {
    id: 'payments',
    title: '10. Payments and Billing (via Stripe or other Processors)',
    blocks: [
      { type: 'p', text: 'All payments for {SITE} services (including subscriptions like Golden Carrot, and any future features like tipping or commissions) are processed by third-party payment providers (such as **Stripe, Inc**. or its affiliates). We do not collect or store your full credit card details on our servers.' },
      {
        type: 'ul',
        items: [
          'Stripe Payments: By making a purchase on RabbitHole, you agree to comply with Stripe’s terms and any relevant payment terms. Stripe may perform fraud checks or require additional authentication (for example, 3-D Secure verification for EU cards).',
          'Billing Information: You must provide accurate billing information and keep it up-to-date. If your payment method fails or your account is past due, we may suspend or revoke the associated services (e.g., your premium features) until payment is resolved. In case of payment failure for a subscription, we may attempt to charge again after a short period or downgrade your account to free status.',
          'Invoices/Receipts: We (or Stripe on our behalf) will email you a receipt for each successful transaction. For subscriptions, you will be billed at the stated intervals automatically. You can access your billing history or manage your subscription via your account settings or a provided customer portal link.',
          'Refunds & Chargebacks: Apart from your legal rights (see Section 9 on the withdrawal right for EU consumers), all charges are generally non-refundable. However, if you believe there was an error in billing or you experienced an issue with the service that warrants a refund, please contact support. Unauthorized chargebacks or payment disputes that are unfounded may result in account suspension.',
          'Future Monetization Features: If {SITE} introduces user-to-user financial transactions (for example, **tipping creators, commission payments**, or a **shop** for digital/physical goods), those transactions might be facilitated by third-party services (such as Stripe Connect, PayPal, or others). Additional terms of use may apply for those features, including compliance with platform rules (e.g., no selling prohibited content) and the payment provider’s policies. We will provide clear information at launch of such features, and you may need to agree to separate creator payment terms if you choose to participate as a seller.'
        ],
      },
    ],
  },
  {
    id: 'thirdparty',
    title: '11. Third-Party Services and Integrations',
    blocks: [
      { type: 'p', text: '{SITE} integrates with various third-party services to provide a richer experience. By using RabbitHole, you acknowledge and agree that:' },
      {
        type: 'ul',
        items: [
         'Hosting and Storage: We rely on cloud hosting and content delivery networks (CDNs) (for example, cloud infrastructure providers) to store and serve content. These providers act as our data processors under GDPR, and we have agreements in place to safeguard data.',
         'Media Processing: We may use third-party tools for image or video processing (e.g., for transcoding videos or scanning images for inappropriate content). If we implement a **music feature** (like allowing you to add profile background music), it might involve integration with an external music service or API (for example, using Spotify, YouTube, or a similar service). In such cases, you may be subject to those services’ terms when you link your account or content. We will clarify any such integration in the app (e.g., “By connecting your Spotify account, you agree to Spotify’s terms”).',
         'Analytics: We use analytics and error tracking services to improve our product (for example, privacy-focused analytics that do not track individual identities, or crash reporting services to fix bugs). These services may collect technical information (like device type, OS version, general location) but are configured, as much as possible, to avoid collecting personal data or to anonymize it.',
         'Payment Processors: As noted, Stripe or other payment processors handle financial transactions. When you make a purchase or receive a payment, you are also subject to the payment processor’s terms and privacy policy. We do not control third-party processing of payments, but we choose reputable providers that comply with security standards.',
         'Content Links: If users post links to third-party websites or services, {SITE} is not responsible for those external sites. Be cautious when clicking links; third-party sites have their own terms and privacy policies. We do not endorse or assume liability for external content.',
         'APIs and Extensions: If we offer an API or allow third-party apps/extensions to interface with RabbitHole, use of those features may be subject to separate API terms. Likewise, if you use a third-party client or app to access {SITE} (where available), understand that we do not officially endorse third-party apps and your use of them is at your own risk.',
         'No Liability for Third Parties: We are not liable for the actions or omissions of third-party service providers, except as mandated by law. However, if you encounter an issue with a third-party integration (for instance, a broken link or an embedded player not working), you can report it and we will attempt to assist or resolve it where we can.'
        ],
      },
    ],
  },
  {
    id: 'warranty',
    title: '12. Disclaimers of Warranties',
    blocks: [
      { type: 'p', text: '**“As-Is” Service:** {SITE} is provided to you on an “**as is**” and “**as available**” basis. While we strive to provide a great service, we **do not guarantee** that the Service will meet all your expectations or requirements, or that it will be uninterrupted, secure, or error-free at all times' },
      {
        type: 'ul',
        items: [
          'We disclaim any warranties or conditions of merchantability, fitness for a particular purpose, and non-infringement to the fullest extent allowed by applicable law. In plain language, we can’t promise that the site will never have bugs or that content will always be safe or accurate.',
          'Content on {SITE} is largely user-generated. We do not endorse or guarantee the accuracy, quality, or reliability of any user content. You understand you might encounter content that you find objectionable or incorrect, and you use the Service at your own risk.',
          'Any advice or information (oral or written) obtained from {SITE} or its users or elsewhere does not create any warranty not expressly stated in these Terms.',
          '**No Guarantee of Results:** Whether you are using {SITE} as an artist or an art appreciator, we don’t guarantee any particular outcomes (for example, we can’t guarantee you will gain a certain number of followers or sales). Any promotional or discovery features are provided with no warranty of effectiveness.'
        ]
      },
      {
        type: 'p',
        text: '*Nothing in these Terms will affect any statutory warranties that cannot be disclaimed or limited under applicable law (for instance, certain consumer rights under Polish or EU law that provide protections). These disclaimer terms are intended to clarify that the service might have issues and is provided without broad guarantees*.'
      }
    ],
  },
  {
    id: 'liability',
    title: '13. Limitation of Liability & Indemnity',
    blocks: [
      {
        type: 'ul',
        items: [
          {text: 'Limitation of Liability: To the maximum extent permitted by law, {COMPANY} (and its officers, directors, employees, and agents) **will not be liable** for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses. This applies to any theory of liability, whether based on warranty, contract, statutory law, tort (including negligence), or otherwise, even if we have been advised of the possibility of such damages.', items: [
            'For example, we are not liable for damages resulting from: your use of (or inability to use) {SITE}; unauthorized access to or alterations of your transmissions or content; or the conduct of any third party on the service including defamatory, offensive, or illegal conduct of other users or third parties.',
          ]},
          'Cap on Liability for Paid Users: To the extent that we are found liable notwithstanding the above (and except for cases involving death, personal injury, or intentional wrongdoing), our total liability to any user **in aggregate** will not exceed the greater of: (a) the total fees you have paid to us for premium services in the **last 12 months** before the claim, **or** (b) EUR 50. This limitation reflects the fact that a free service is provided without charge and even paid services are relatively low-cost.',
          'Exceptions: Nothing in these Terms limits or excludes our liability for **gross negligence, intentional misconduct, death or personal injury caused by our negligence, or any other liability which cannot be limited or excluded by law**. Some jurisdictions do not allow the exclusion of certain warranties or conditions or the limitation/exclusion of certain liabilities. In such cases, the above disclaimers and limits will apply to the maximum extent permitted by applicable law.',
          {text: 'Your Indemnification to Us: You agree to indemnify and hold harmless {COMPANY} and its affiliates, officers, employees, and agents from any losses, liabilities, claims, demands, damages, expenses, or costs (including reasonable attorney’s fees) arising out of or related to:', items: [
            'Your breach of these Terms or of any law or regulation,',
            'Your infringement of any intellectual property or other right of any person or entity,',
            'Your Content (for example, if you post content that causes damage to someone else and they bring a claim against us), **or**',
            'Your use of the Service in violation of any law or regulation.\nWe reserve the right to handle our legal defense as we see fit, including choosing our counsel, and you agree to cooperate with us in asserting any defenses.'
          ]},
        ],
      },
    ],
  },
  {
    id: 'law',
    title: '14. Governing Law, Jurisdiction & Dispute Resolution',
    blocks: [
      { type: 'ul', items: [
        'Governing Law: These Terms and any dispute arising from them or the Service are governed by the laws of **Poland**, without regard to its conflict of laws principles. However, if you are a consumer located in another EU country, you may also have the protection of mandatory provisions of the law of your country of residence (per EU Regulation Rome I on contractual obligations).',
        'Jurisdiction: Any disputes will be subject to the non-exclusive jurisdiction of the courts **competent for the registered seat of {COMPANY} in Poland**. This means that if you wish to bring proceedings against us, you should do so in Poland. However, as a consumer, you may also have the right to bring an action in your home country’s courts. We will not deprive you of any mandatory consumer forum rights.',
        'European Online Dispute Resolution (ODR): If you are an EU consumer, you have the option to use the European Commission’s Online Dispute Resolution platform to resolve disputes. The ODR platform is available at ec.europa.eu/consumers/odr. This platform is a web-based tool that allows EU consumers and traders to resolve disputes out of court. We can provide our contact email ([CONTACT_EMAIL](mailto:{CONTACT_EMAIL})) for the ODR process if needed.',
        'No Class Actions: To the extent permissible by applicable law, you and {SITE} agree that each may bring claims against the other **only in an individual capacity** and not as a plaintiff or class member in any purported class or representative action. (This clause does not apply where prohibited by law, and in particular, does not override any rights you have under EU collective redress mechanisms should those become applicable.)',
        'Local Legal Requirements: We make no representation that the Service is appropriate or available in any particular location. You are responsible for compliance with local laws if you access RabbitHole from outside the EU. However, our Terms are primarily intended to comply with EU and Polish law.'
      ]},
    ],
  },
  {
    id: 'changes',
    title: '15. Changes to the Terms',
    blocks: [
      { type: 'ul', items: [
        'We may revise or update these Terms from time to time, especially to adapt to new legal requirements, improve clarity, or adjust to changes in our Service. If we make material changes (for example, changes that significantly affect your rights or obligations), we will notify users in advance by appropriate means – for instance, by an in-app announcement, by email, or by posting a notice on our website. Where feasible, we will provide at least **15 days’ notice** before new terms take effect, in accordance with applicable laws (e.g., some jurisdictions or platform rules require advance notice for changes).',
        'If you continue to use {SITE} after the updated Terms come into effect, that constitutes acceptance of the changes. If you do not agree to the revised Terms, you should stop using the Service and, if applicable, cancel any premium subscription (you may be entitled to a pro-rata refund if you paid for a period beyond your usage).',
        'For non-material changes (such as minor textual edits or corrections), we may not provide advance notice, but the latest version of the Terms will always be available on our site with the “Effective Date” posted at the top.',
        'We archive old versions of our Terms and can provide them upon request so that changes are transparent.'
      ]},
    ],
  },
  {
    id: 'contact',
    title: '16. Contact Information',
    blocks: [
      { type: 'p', text: 'If you have any questions, concerns, or feedback about these Terms or the Service, you can reach out to us:' },
      { type: 'ul', items: [
        'Controller/Operator: {COMPANY}',
        'Registered Address: {COMPANY_ADDR}',
        'Email: [CONTACT_EMAIL](mailto:{CONTACT_EMAIL})',
      ]},
      { type: 'p', text: 'We typically respond to user inquiries within a few business days. For any legal notices or service of process, please send them to our registered address with a copy via email if possible.' },
    ],
  },
];
