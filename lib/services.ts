export type Service = {
  id: string;
  /** Set to false to hide a service from the site and booking form without deleting it. */
  enabled?: boolean;
  title: { en: string; ar: string };
  short: { en: string; ar: string };
  includes: { en: string[]; ar: string[] };
};

export const ALL_SERVICES: Service[] = [
  {
    id: "web",
    title: { en: "Websites & apps", ar: "مواقع وتطبيقات" },
    short: {
      en: "Fast, bilingual websites, online stores and mobile apps that turn visitors into customers.",
      ar: "مواقع ومتاجر إلكترونية وتطبيقات سريعة وثنائية اللغة تحوّل الزائر إلى عميل.",
    },
    includes: {
      en: ["Websites and online stores", "iOS and Android apps", "Arabic and English, right-to-left ready", "Hosting, security and updates"],
      ar: ["مواقع ومتاجر إلكترونية", "تطبيقات iOS وأندرويد", "عربي وإنجليزي مع دعم الاتجاه من اليمين لليسار", "استضافة وحماية وتحديثات"],
    },
  },
  {
    id: "brand",
    enabled: false, // hidden for now. Remove this line to show it again.
    title: { en: "Brand & design", ar: "هوية وتصميم" },
    short: {
      en: "A name, a logo and a visual language people remember, applied everywhere you show up.",
      ar: "اسم وشعار ولغة بصرية لا تُنسى، تُطبَّق في كل مكان تظهر فيه.",
    },
    includes: {
      en: ["Logo and identity system", "Brand guidelines", "Social media and print design", "Packaging and presentations"],
      ar: ["شعار ونظام هوية متكامل", "دليل استخدام الهوية", "تصميم السوشيال ميديا والمطبوعات", "العبوات والعروض التقديمية"],
    },
  },
  {
    id: "marketing",
    enabled: false, // hidden for now. Remove this line to show it again.
    title: { en: "Marketing & growth", ar: "تسويق ونمو" },
    short: {
      en: "Campaigns, content and search that bring the right people to you and tell you what worked.",
      ar: "حملات ومحتوى وظهور في البحث يجلب الأشخاص المناسبين ويُظهر لك ما نجح فعلًا.",
    },
    includes: {
      en: ["Paid ads and SEO", "Content and social media", "Email and WhatsApp campaigns", "Monthly performance reports"],
      ar: ["إعلانات مدفوعة وتحسين محركات البحث", "محتوى وإدارة سوشيال ميديا", "حملات البريد وواتساب", "تقارير أداء شهرية"],
    },
  },
  {
    id: "software",
    enabled: false, // hidden for now. Remove this line to show it again.
    title: { en: "Custom software", ar: "برمجيات مخصصة" },
    short: {
      en: "Dashboards, portals and internal systems built around how your business actually runs.",
      ar: "لوحات تحكم وبوابات وأنظمة داخلية مبنية حول طريقة عمل شركتك الفعلية.",
    },
    includes: {
      en: ["Management systems and CRMs", "Customer and partner portals", "Integrations with the tools you use", "Data dashboards"],
      ar: ["أنظمة إدارة وCRM", "بوابات للعملاء والشركاء", "ربط مع الأدوات التي تستخدمها", "لوحات بيانات"],
    },
  },
  {
    id: "automation",
    enabled: false, // hidden for now. Remove this line to show it again.
    title: { en: "Automation & AI", ar: "أتمتة وذكاء اصطناعي" },
    short: {
      en: "Hand the repetitive work to software: replies, reports, invoices, follow-ups.",
      ar: "سلّم الأعمال المتكررة للبرمجيات: الردود والتقارير والفواتير والمتابعات.",
    },
    includes: {
      en: ["Workflow automation", "AI assistants and chatbots", "Document and data processing", "Process audit to find what to automate"],
      ar: ["أتمتة سير العمل", "مساعدون ذكيون وشات بوت", "معالجة المستندات والبيانات", "تدقيق العمليات لتحديد ما يمكن أتمتته"],
    },
  },
  {
    id: "strategy",
    enabled: false, // hidden for now. Remove this line to show it again.
    title: { en: "Strategy & consulting", ar: "استراتيجية واستشارات" },
    short: {
      en: "A clear plan before you spend: what to build, in which order, and what it should cost.",
      ar: "خطة واضحة قبل أن تنفق: ماذا تبني، وبأي ترتيب، وكم يجب أن يكلف.",
    },
    includes: {
      en: ["Digital transformation roadmap", "Product and market review", "Technology selection", "Team training and workshops"],
      ar: ["خارطة طريق للتحول الرقمي", "مراجعة المنتج والسوق", "اختيار التقنيات", "تدريب الفرق وورش العمل"],
    },
  },
  {
    id: "other",
    enabled: false, // hidden for now. Remove this line to show it again.
    title: { en: "Something else", ar: "شيء آخر" },
    short: {
      en: "Your need doesn't fit a category? Good. Describe it and we'll tell you how we'd solve it.",
      ar: "احتياجك لا يندرج تحت تصنيف؟ ممتاز. اشرحه لنا ونخبرك كيف سنحله.",
    },
    includes: {
      en: ["Free first conversation", "Honest answer if it's not for us", "Scope and fixed price within 3 days"],
      ar: ["أول حوار مجانًا", "إجابة صريحة إن لم نكن مناسبين", "نطاق وسعر ثابت خلال ٣ أيام"],
    },
  },
];

/** Only the services currently shown on the site. */
export const SERVICES: Service[] = ALL_SERVICES.filter((s) => s.enabled !== false);
