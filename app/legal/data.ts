export const SITE = 'RabbitHole';
export const COMPANY = 'Rabbit Tale & Company. z o.o.';
export const CONTACT_EMAIL = 'support@rabbit-hole.app';
export const ADDRESS = 'Your Street 1, 00-000 City, Country';
export const EFFECTIVE_PRIVACY = '2025-08-29';
export const EFFECTIVE_TERMS = '2025-08-29';

// Optional company fields (for legal pages needing extended metadata)
export const COMPANY_ADDR = ADDRESS;
export const COMPANY_KRS = '';
export const COMPANY_NIP = '';
export const COMPANY_REGON = '';
export const DPO_EMAIL = '';

// ---------------------- Privacy ----------------------

export const PRIVACY_SECTIONS = [
  { id: 'controller', title: '1. Controller & Contact' },
  { id: 'data', title: '2. Categories of Personal Data' },
  { id: 'sources', title: '3. Sources' },
  { id: 'purposes', title: '4. Purposes & Legal Bases (GDPR Art. 6)' },
  { id: 'automated', title: '5. Automated Decisions & Profiling' },
  { id: 'recipients', title: '6. Recipients & Processors' },
  { id: 'transfers', title: '7. International Transfers' },
  { id: 'retention', title: '8. Retention' },
  { id: 'rights', title: '9. Your GDPR Rights' },
  { id: 'cookies', title: '10. Cookies & Similar Tech' },
  { id: 'children', title: '11. Children' },
  { id: 'security', title: '12. Security' },
  { id: 'complaints', title: '13. Complaints (Poland — UODO)' },
  { id: 'changes', title: '14. Changes' },
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
    id: 'controller',
    title: '1. Controller & Contact',
    blocks: [
      { type: 'p', text: '{SITE} is operated for users in the European Union. This Privacy Policy is EU/EEA–focused and governed by GDPR. If you are outside the EU/EEA, we still apply these standards where feasible.' },
      { type: 'p', text: 'Controller: {COMPANY}, {COMPANY_ADDR}. Contact: [CONTACT_EMAIL](mailto:{CONTACT_EMAIL}). If appointed, our Data Protection Officer can be reached at the same email.' },
    ],
  },
  {
    id: 'data',
    title: '2. Categories of Personal Data',
    blocks: [
      {
        type: 'ul',
        items: [
          'Account data: email, display name, password hash, profile fields, settings/preferences.',
          'User content: posts, images, videos, audio, captions, comments, likes, reports, folders/collections, content ratings (e.g., NSFW tags), profile music metadata (if enabled).',
          'Direct messages: message content and metadata (sender/recipient, timestamps) when DMs are enabled. Accessed only for safety/legal reasons.',
          'Technical & logs: IP address, device/browser info, identifiers, diagnostics, crash reports, timestamps, cookie/local storage IDs.',
          'Billing: subscription status, plan, Stripe customer ID and transaction metadata (we do not store full card details).',
          'Communications & moderation: support emails, abuse reports, moderation decisions/notes and enforcement records.',
        ],
      },
    ],
  },
  {
    id: 'sources',
    title: '3. Sources',
    blocks: [
      {
        type: 'ul',
        items: [
          'You: registration, profile, posts/uploads, settings, messages, support requests, reports.',
          'Automatically from use: logs, security events, feature interactions, device/browser data.',
          'Third parties: payment processors (e.g., Stripe), email providers, optional sign-in providers (if enabled), or lawful requests from authorities.',
        ],
      },
    ],
  },
  {
    id: 'purposes',
    title: '4. Purposes & Legal Bases (GDPR Art. 6)',
    blocks: [
      {
        type: 'ul',
        items: [
          'Provide the Service (hosting, media delivery, discovery, messaging, moderation tooling) — Art. 6(1)(b) contract.',
          'Premium billing & subscriptions (Stripe) — Art. 6(1)(b) contract; Art. 6(1)(c) legal obligations (accounting/tax).',
          'Security & abuse prevention (rate-limiting, spam/fraud detection, incident logs) — Art. 6(1)(f) legitimate interests.',
          'Service communications (receipts, critical updates, moderation notices) — Art. 6(1)(b)/(c).',
          'Product analytics (privacy-respecting, no cross-site ads) — Art. 6(1)(f); consent if ePrivacy requires non-essential cookies.',
          'Marketing emails (opt-in only) — Art. 6(1)(a) consent; withdraw anytime.',
          'Legal claims & compliance (e.g., DSA requests, IP notices) — Art. 6(1)(c)/(f).',
        ],
      },
    ],
  },
  {
    id: 'automated',
    title: '5. Automated Decisions & Profiling',
    blocks: [
      {
        type: 'p',
        text:
          'We use ranking/recommendation and automated signals to detect spam/abuse. These do not produce legal or similarly significant effects within GDPR Art. 22. Chronological views (if offered) and appeals are available; key parameters are summarized in product help.',
      },
    ],
  },
  {
    id: 'recipients',
    title: '6. Recipients & Processors',
    blocks: [
      {
        type: 'ul',
        items: [
          'Payments: Stripe — subscriptions, invoices, fraud checks.',
          'Hosting & storage/CDN: cloud infrastructure, object storage, image/video processing.',
          'Email delivery: verification, receipts, notices (and marketing only if you consent).',
          'Analytics & logging: privacy-respecting metrics, error/crash reporting.',
          'Moderation & safety tooling: automated signals for abuse/illegal content detection.',
          'Authorities/counsel: where required by law or to defend legal claims.',
          'Business transfers: in a merger/acquisition, with continuity of privacy safeguards.',
        ],
      },
    ],
  },
  {
    id: 'transfers',
    title: '7. International Transfers',
    blocks: [
      {
        type: 'p',
        text:
          'Data is primarily hosted in the EEA. When transferred outside the EEA/UK to countries without an adequacy decision, we use Standard Contractual Clauses and supplementary safeguards as appropriate. Details available on request.',
      },
    ],
  },
  {
    id: 'retention',
    title: '8. Retention',
    blocks: [
      {
        type: 'ul',
        items: [
          'Account data: kept while your account is active; erased/anonymized within a reasonable time after deletion.',
          'Content: until you delete it or your account; backups/CDN caches may persist briefly.',
          'Direct messages: retained until deleted by participants or account removal (subject to lawful holds).',
          'Security logs: typically 30–180 days unless longer needed for investigations.',
          'Billing records: retained per accounting/tax laws (commonly 5–10 years).',
          'Moderation records: kept as needed to manage repeat violations, comply with DSA, or defend claims.',
        ],
      },
    ],
  },
  {
    id: 'rights',
    title: '9. Your GDPR Rights',
    blocks: [
      {
        type: 'ul',
        items: [
          'Access, rectification, erasure (“right to be forgotten”).',
          'Restriction and objection (incl. to processing based on legitimate interests).',
          'Data portability (for data you provided, processed by automated means under contract/consent).',
          'Withdraw consent at any time (does not affect past processing).',
          'No decisions based solely on automated processing with legal/similar effects.',
          'Exercise rights via [CONTACT_EMAIL](mailto:{CONTACT_EMAIL}); we may verify identity and respond within one month (extendable for complexity).',
        ],
      },
    ],
  },
  {
    id: 'cookies',
    title: '10. Cookies & Similar Tech',
    blocks: [
      {
        type: 'ul',
        items: [
          'Strictly necessary: auth/session, security, preferences.',
          'Analytics: optional and consent-based where required (ePrivacy). Manage choices in cookie settings.',
          'Embedded media may set third-party cookies; we use privacy-enhanced modes where possible.',
        ],
      },
    ],
  },
  {
    id: 'children',
    title: '11. Children',
    blocks: [
      { type: 'p', text: 'The Service is not directed to children below the digital consent age. In Poland this is generally 16; younger users require verified parental authorization. NSFW content is age-restricted and must be tagged.' },
    ],
  },
  {
    id: 'security',
    title: '12. Security',
    blocks: [
      { type: 'p', text: 'We apply technical/organizational measures: TLS, hashed passwords, access controls, backups, vulnerability management, monitoring. No system is 100% secure—report incidents to [CONTACT_EMAIL](mailto:{CONTACT_EMAIL}).' },
    ],
  },
  {
    id: 'complaints',
    title: '13. Complaints (Poland — UODO)',
    blocks: [
      { type: 'p', text: 'You may lodge a complaint with the President of the Personal Data Protection Office (UODO), ul. Stawki 2, 00-193 Warszawa, Poland — [uodo.gov.pl](https://uodo.gov.pl).' },
    ],
  },
  {
    id: 'changes',
    title: '14. Changes',
    blocks: [
      { type: 'p', text: 'We may update this Policy. Material changes will be announced in-app or by email before they take effect; the “Effective Date” will be updated.' },
    ],
  },
];

// ---------------------- Terms ----------------------

export const TERMS_SECTIONS = [
  { id: 'acceptance', title: '1. Acceptance & Definitions' },
  { id: 'eligibility', title: '2. Eligibility & Accounts' },
  { id: 'service', title: '3. Service Description & Availability' },
  { id: 'content', title: '4. Your Content & License' },
  { id: 'conduct', title: '5. Prohibited Conduct & Content' },
  { id: 'moderation', title: '6. Content Moderation' },
  { id: 'ip', title: '7. Intellectual Property & Notices' },
  { id: 'privacy', title: '8. Privacy' },
  { id: 'premium', title: '9. Premium (Golden Carrot)' },
  { id: 'payments', title: '10. Payments via Stripe' },
  { id: 'thirdparty', title: '11. Third-party Services' },
  { id: 'warranty', title: '12. Disclaimers' },
  { id: 'liability', title: '13. Limitation of Liability & Indemnity' },
  { id: 'law', title: '14. Governing Law, ODR & Venue' },
  { id: 'changes', title: '15. Changes to the Terms' },
  { id: 'contact', title: '16. Contact' },
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
