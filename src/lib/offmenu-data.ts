import fs from "node:fs";
import path from "node:path";
import type {
  CaseStudy,
  NavLink,
  StudioAboutContent,
  WorkProjectDetail,
} from "@/types/offmenu";

export const offMenuHeroWords = [
  "STUDIO",
  "FINITY",
  "is",
  "a",
  "design",
  "studio",
  "shapinghow",
  "brands",
  "look,",
  "move,",
  "and",
  "show",
  "up.",
];

export const offMenuNavigationLinks: NavLink[] = [
  { label: "Work", href: "/", current: true },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services", disabled: true },
  { label: "Writing", href: "/blog", disabled: true },
  { label: "Get in touch", href: "mailto:christian@offmenu.design", external: true },
];

export const offMenuWorkNavigationLinks: NavLink[] = [
  { label: "Work", href: "/", current: true },
  { label: "Services", href: "/services", disabled: true },
  { label: "Approach", href: "/approach", disabled: true },
  { label: "Writing", href: "/blog", disabled: true },
  { label: "Get in touch", href: "mailto:christian@offmenu.design", external: true },
];

export const offMenuResourceLinks: NavLink[] = [
  {
    label: "Twitter / X",
    href: "https://x.com/weareoffmenu",
    external: true,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/offmenudesign",
    external: true,
  },
  { label: "Terms of Service", href: "/terms", disabled: true },
];

interface CsvRow {
  [key: string]: string;
}

function parseCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let index = 0;
  let inQuotes = false;

  while (index < input.length) {
    const character = input[index];

    if (inQuotes) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 2;
          continue;
        }

        inQuotes = false;
        index += 1;
        continue;
      }

      field += character;
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = true;
      index += 1;
      continue;
    }

    if (character === ",") {
      row.push(field);
      field = "";
      index += 1;
      continue;
    }

    if (character === "\n") {
      row.push(field);
      field = "";

      if (row.some((value) => value !== "")) {
        rows.push(row);
      }

      row = [];
      index += 1;
      continue;
    }

    if (character === "\r") {
      index += 1;
      continue;
    }

    field += character;
    index += 1;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((value) => value !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

function decodeHtmlEntities(input: string) {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'");
}

function htmlToText(html: string) {
  const withLineBreaks = html
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "");

  return decodeHtmlEntities(withLineBreaks)
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

function htmlToList(html: string) {
  return htmlToText(html)
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function excerpt(text: string, length = 190) {
  if (text.length <= length) {
    return text;
  }

  return `${text.slice(0, length).trim()}...`;
}

function formatCategory(category: string) {
  const parts = category
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.join(" / ");
}

const csvPath = path.join(process.cwd(), "data", "Works.csv");
const csvText = fs.readFileSync(csvPath, "utf8");
const csvRows = parseCsv(csvText);
const csvHeaders = csvRows[0] ?? [];
const worksRows: CsvRow[] = csvRows.slice(1).map((row) =>
  Object.fromEntries(csvHeaders.map((header, index) => [header, row[index] ?? ""])),
);

const allWorkProjectsInternal: WorkProjectDetail[] = worksRows.map((row, index, rows) => {
  const galleryImages = [
    {
      src: row["Image (full 1)"],
      alt: row["Image (full 1):alt"],
    },
    {
      src: row["Image (full 2) or Poster for vid"],
      alt: row["Image (full 2) or Poster for vid:alt"],
    },
    {
      src: row["Image (full 3)"],
      alt: row["Image (full 3):alt"],
    },
    {
      src: row["Image (full 4)"],
      alt: row["Image (full 4):alt"],
    },
    {
      src: row["Image (full 5)"],
      alt: row["Image (full 5):alt"],
    },
    {
      src: row["Image (full 6)"],
      alt: row["Image (full 6):alt"],
    },
  ].filter((image) => image.src);

  const creditsRoles = htmlToList(row["Credits (left side)"]);
  const creditsNames = htmlToList(row["Credits"]);
  const introduction = htmlToText(row["Content"]);
  const summary = row["SEO"] ? decodeHtmlEntities(row["SEO"]).trim() : excerpt(introduction);
  const nextOne = rows[(index + 1) % rows.length]?.["Slug"];
  const nextTwo = rows[(index + 2) % rows.length]?.["Slug"];

  return {
    slug: row["Slug"],
    title: row["Title"],
    heroImageLight: row["Main Image"] || row["Hover Image (footer)"],
    heroImageDark: row["Main Image"] || row["Hover Image (footer)"],
    introduction,
    summary,
    details: [
      { label: "Category", value: row["Category"] || "Work" },
      { label: "Studio", value: "Studio Finity" },
      {
        label: "Credits",
        value: creditsNames.length > 0 ? `${creditsNames.length} collaborators` : "Studio Finity",
      },
    ],
    credits: {
      roles: creditsRoles,
      names: creditsNames,
    },
    galleryImages,
    relatedSlugs: [nextOne, nextTwo].filter(Boolean) as string[],
    ctaTitle: "Let's build something.",
    ctaHref: "mailto:christian@offmenu.design",
    ctaLabel: "Get in touch",
  };
});

export const allWorkProjects = allWorkProjectsInternal;

export const offMenuCaseStudies: CaseStudy[] = allWorkProjectsInternal.map((project) => ({
  slug: project.slug,
  title: project.title,
  href: `/work/${project.slug}`,
  thumbnailLight: project.heroImageLight,
  thumbnailDark: project.heroImageDark,
  thumbnailLightXl: project.heroImageLight,
  thumbnailDarkXl: project.heroImageDark,
  desktopPosition: { x: 0, y: 0, size: 0 },
  mobilePosition: { x: 0, y: 0, size: 0 },
}));

export const homepageCaseStudies = offMenuCaseStudies.slice(0, 8);

export function getCaseStudyBySlug(slug: string) {
  return offMenuCaseStudies.find((caseStudy) => caseStudy.slug === slug);
}

export function getWorkProjectBySlug(slug: string) {
  return allWorkProjects.find((project) => project.slug === slug);
}

export const studioFinityAboutContent: StudioAboutContent = {
  hero:
    "We shape brands and build visual work with the same level of precision. From identity systems to digital experiences, campaigns, and films, Studio Finity creates work with clear ideas, sharp execution, and a finish that holds weight.",
  introLabel: "Intro",
  intro:
    "Studio Finity is a design studio working across brand, digital, and visual storytelling. We help brands look distinct, feel elevated, and communicate with clarity—whether the audience meets you on a website, in a campaign, or in a short-form cut.",
  location: "Based in Denver, CO.",
  rules: [
    { id: "001", statement: "The answer could be right in front of you." },
    { id: "002", statement: "If it doesn’t engage, it doesn’t work." },
    { id: "003", statement: "Focus is a weapon. Use it." },
    { id: "004", statement: "Simplicity is the standard." },
    { id: "005", statement: "Nothing is new. Only perspective is." },
    { id: "006", statement: "Decide what not to do. Ruthlessly." },
    { id: "007", statement: "Consistency is everything." },
    { id: "008", statement: "Excellence comes from discipline, not talent." },
    { id: "009", statement: "If it costs nothing, it means nothing." },
    { id: "010", statement: "Do what is right. Not what is easy." },
    { id: "011", statement: "Fail. Learn. Fail. Learn." },
  ],
  expertise: [
    "Brand Identity",
    "Web Design",
    "Digital Experiences",
    "Photo",
    "Video",
  ],
  industries: [
    "Digital Products",
    "Architecture & Design",
    "Technology",
    "Fashion & Beauty",
    "Lifestyle",
    "Real Estate & Development",
    "Culture & Galleries",
    "Wellness & Sport",
  ],
  clients: [
    "ON",
    "Compassion",
    "RE/MAX",
    "Port of Subs",
    "Milk Tea People",
    "Baxo",
    "Casting Crowns",
    "Fight The New Drug",
    "Thompson Hotels",
  ],
};

export function getFormattedCategory(category: string) {
  return formatCategory(category);
}
