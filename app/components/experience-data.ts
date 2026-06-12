// Shared experience data for the reimagined section variants.

export type Role = {
  company: string;
  role: string;
  period: string;
  start: string; // year used as the oversized ghost numeral
  current?: boolean;
  highlight: string;
  keywords: string[];
};

export const roles: Role[] = [
  {
    company: "Carmatik",
    role: "Frontend Developer",
    period: "Mar 2025 — Present",
    start: "2025",
    current: true,
    highlight:
      "A 5-step B2C insurance flow on carmatik.ro — multi-provider offers and Netopia checkout, atop a Java/JSP platform.",
    keywords: ["10+ Storefronts", "Insurance Flow", "CMS Integration", "AI Assistant"],
  },
  {
    company: "Urbanlab",
    role: "Frontend Developer · NGO",
    period: "Mar 2024 — Mar 2025",
    start: "2024",
    highlight:
      "An interactive heritage map of the Jiu Valley across four cities, with editor-driven pins and 3D building models.",
    keywords: ["Heritage Map", "Webflow CMS", "3D Model Viewer", "Scroll Narrative"],
  },
  {
    company: "Various Clients",
    role: "Freelance Frontend Developer",
    period: "Jan 2023 — Mar 2025",
    start: "2023",
    highlight:
      "End-to-end web projects across multiple industries, plus hand-coded conversion funnels for Simplify Creative Agency.",
    keywords: ["End-to-End", "Conversion Funnels", "E-commerce", "Brand-to-Code"],
  },
];

export const num = (i: number) => String(i + 1).padStart(2, "0");
