// Financial Clinic Results Page - Design Constants
// Based on the exact design specification

export const RESULTS_COLORS = {
  // Primary colors
  primaryGreen: "#437749",
  accentGreen: "#3fab4c",
  darkGreen: "#456237",
  
  // Golden accent color - Financial Clinic brand
  golden: "#bd912e",
  goldenLight: "#d4a84a",
  goldenDark: "#9a7625",

  // Text colors
  darkText: "#424b5a",
  grayText: "#a1aeb7",
  mediumGray: "#767f87",
  lightGray: "#737c84",
  titleGray: "#46545f",

  // Background colors
  lightBg: "#f8fbfd",
  cardBg: "#ffffff",

  // Border colors
  borderColor: "#c2d1d9",
  cardBorder: "#bdcdd6",

  // Score bands
  bandRed: "#f00c01", // 1-29: At Risk
  bandOrange: "#fe6521", // 30-59: Needs Improvement
  bandYellow: "#fca924", // 60-79: Good
  bandGreen: "#6cc922", // 80-100: Excellent

  // Progress bar
  progressBg: "#E1E1EA",
  progressFill: "#6CA854",
  progressStripe: "#456237",
} as const;

export const SCORE_BANDS = [
  {
    range: "1-29",
    bgColor: "bg-[#f00c01]",
    title: { en: "Needs Improvement", ar: "بحاجة إلى تحسين" },
    description: {
      en: "Focus on building basic financial habits",
      ar: "ركّزوا على اكتساب السلوكيات المالية الأساسية",
    },
  },
  {
    range: "30-59",
    bgColor: "bg-[#fe6521]",
    title: { en: "Fair", ar: "مقبولة" },
    description: {
      en: "Good foundation, room for growth",
      ar: "أساس متين مع إمكانية للتطوّر",
    },
  },
  {
    range: "60-79",
    bgColor: "bg-[#fca924]",
    title: { en: "Good", ar: "جيّدة" },
    description: {
      en: "Strong financial health",
      ar: "صحّة مالية قويّة",
    },
  },
  {
    range: "80-100",
    bgColor: "bg-[#6cc922]",
    title: { en: "Excellent", ar: "ممتازة" },
    description: {
      en: "Outstanding financial wellness",
      ar: "رفاهية مالية ملحوظة",
    },
  },
] as const;

export const CATEGORY_DESCRIPTIONS = {
  "Income Stream": {
    en: "Stability and diversity of income sources",
    ar: "استقرار وتنوّع في مصادر الدخل",
  },
  "Monthly Expenses Management": {
    en: "Budgeting and expense control",
    ar: "إدارة الميزانية والتحكم في النفقات",
  },
  "Savings Habit": {
    en: "Saving behavior and emergency preparedness",
    ar: "عادات الادخار والاستعداد لحالات الطوارئ",
  },
  "Emergency Savings": {
    en: "Emergency fund readiness",
    ar: "الاستعداد للادخار في حالات الطوارئ",
  },
  "Debt Management": {
    en: "Debt control and debit health",
    ar: "التحكّم في الديون والصحّة الائتمانية",
  },
  "Retirement Planning": {
    en: "Long-term financial security",
    ar: "الأمان المالي الطويل الأمد",
  },
  "Protecting Your Assets | Loved Ones": {
    en: "Insurance and risk management",
    ar: "التأمين وإدارة المخاطر",
  },
  "Planning for Your Future | Siblings": {
    en: "Financial planning and family preparation",
    ar: "التخطيط المالي والاستعداد للعائلة",
  },
  "Protecting Your Family": {
    en: "Ensuring financial wellbeing for your loved ones",
    ar: "ضمان الرفاهية المالية لأحبائك",
  },
} as const;
