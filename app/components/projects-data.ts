// Shared work data — consumed by the hero (work is merged into the hero now).
export type Project = { name: string; tag: string; image: string };

export const projects: Project[] = [
  { name: "Carmatik Storefronts", tag: "Dealership SaaS", image: "https://picsum.photos/seed/carmatik/900/900" },
  { name: "Insurance Module", tag: "Multi-step flow", image: "https://picsum.photos/seed/insurance/900/900" },
  { name: "Urbanlab Heritage", tag: "Interactive map", image: "/urbanlab3.png" },
  { name: "AI Chat Assistant", tag: "Conversational UI", image: "https://picsum.photos/seed/aichat/900/900" },
  { name: "Sales Funnels", tag: "Conversion funnels", image: "https://picsum.photos/seed/funnels/900/900" },
  { name: "CMS Websites", tag: "Webflow · CMS", image: "https://picsum.photos/seed/cmsdev/900/900" },
];

export const projectImages = projects.map((p) => p.image);

export const num = (i: number) => String(i + 1).padStart(2, "0");
