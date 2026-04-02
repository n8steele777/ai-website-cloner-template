import fs from "node:fs";
import path from "node:path";
import type {
  CaseStudy,
  NavLink,
  StudioAboutContent,
  WorkProjectDetail,
} from "@/types/offmenu";
import { studioContactMailtoHref } from "@/lib/studio-contact";

export const offMenuHeroWords = [
  "STUDIO",
  "FINITY",
  "is",
  "a",
  "design",
  "studio",
  "shaping",
  "how",
  "brands",
  "look,",
  "move,",
  "and",
  "show",
  "up.",
];

export const offMenuNavigationLinks: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Works", href: "/work" },
  {
    label: "Contact",
    href: studioContactMailtoHref(),
    external: true,
    opensContactForm: true,
  },
];

export const offMenuWorkNavigationLinks: NavLink[] = [
  { label: "About", href: "/about" },
  { label: "Works", href: "/work" },
  {
    label: "Contact",
    href: studioContactMailtoHref(),
    external: true,
    opensContactForm: true,
  },
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
  const galleryMedia = [
    {
      kind: "image" as const,
      src: row["Image (full 1)"],
      alt: row["Image (full 1):alt"],
    },
    {
      kind: "image" as const,
      src: row["Image (full 2) or Poster for vid"],
      alt: row["Image (full 2) or Poster for vid:alt"],
    },
    {
      kind: "image" as const,
      src: row["Image (full 3)"],
      alt: row["Image (full 3):alt"],
    },
    {
      kind: "image" as const,
      src: row["Image (full 4)"],
      alt: row["Image (full 4):alt"],
    },
    {
      kind: "image" as const,
      src: row["Image (full 5)"],
      alt: row["Image (full 5):alt"],
    },
    {
      kind: "image" as const,
      src: row["Image (full 6)"],
      alt: row["Image (full 6):alt"],
    },
  ].filter((image) => image.src);

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
    galleryMedia,
    relatedSlugs: [nextOne, nextTwo].filter(Boolean) as string[],
    ctaTitle: "Let's build something.",
    ctaHref: "mailto:hello@studio-finity.com",
    ctaLabel: "Get in touch",
  };
});

export const allWorkProjects = allWorkProjectsInternal;

export const offMenuCaseStudies: CaseStudy[] = allWorkProjectsInternal.map((project) => ({
  slug: project.slug,
  title: project.title,
  href: `/work/${project.slug}`,
  summary: project.summary ?? "",
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
    "We shape brands and build visual work with the same level of precision.\nFrom identity systems to digital experiences, campaigns, and films, Studio Finity creates work with clear ideas, sharp execution, and a finish that holds weight.",
  introLabel: "Intro",
  intro:
    "Studio Finity is a design studio working across brand, digital, and visual storytelling. We help brands look distinct, feel elevated, and communicate with clarity—whether the audience meets you on a website, in a campaign, or in a short-form cut.",
  location: "Based in Denver, CO.",
  rules: [
    {
      id: "001",
      statement: "The answer could be right in front of you.",
      reference: {
        name: "Augustine of Hippo",
        quote:
          "Men go abroad to wonder at the heights of mountains... and pass by themselves without wondering.",
        image: "https://framerusercontent.com/images/ocZtey8XxiX1G0Z3THCXbClJo.jpeg?width=199&height=254",
        rotation: -1,
      },
    },
    {
      id: "002",
      statement: "If it doesn’t engage, it doesn’t work.",
      reference: {
        name: "C.S. Lewis",
        quote: "To interest is the first duty of art.",
        image: "https://framerusercontent.com/images/sRZAfOxiTG636JPDYr7AwzdleE.jpg?width=540&height=702",
        rotation: -4,
      },
    },
    {
      id: "003",
      statement: "Focus is a weapon. Use it.",
      reference: {
        name: "Bruce Lee",
        quote: "The successful warrior is the average man, with laser-like focus.",
        image: "https://framerusercontent.com/images/sZh0IL3xwwLkjerr6qYnoyxtqjQ.jpg?width=327&height=281",
        rotation: 4,
      },
    },
    {
      id: "004",
      statement: "Simplicity is the standard.",
      reference: {
        name: "Coco Chanel",
        quote: "Simplicity is the keynote of all true elegance.",
        image: "https://framerusercontent.com/images/aCNQPRzaDsOM6LRxdNNqKhbBNI.webp?width=2253&height=3000",
        rotation: -4,
      },
    },
    {
      id: "005",
      statement: "Nothing is new. Only perspective is.",
      reference: {
        name: "Virgil Abloh",
        quote: "“New” is a farce to me... my work exists because I’m inspired by the work of others.",
        image: "https://framerusercontent.com/images/RN6mRD4GoUen8gyV0u608xbHmI.jpg?width=809&height=1200",
        rotation: -5,
      },
    },
    {
      id: "006",
      statement: "Decide what not to do. Ruthlessly.",
      reference: {
        name: "Steve Jobs",
        quote: "Deciding what not to do is as important as deciding what to do.",
        image: "https://framerusercontent.com/images/DhWyIShZ97bQFyoQmNwkDcUCbQs.webp?width=1535&height=1328",
        rotation: 1,
      },
    },
    {
      id: "007",
      statement: "Consistency is everything.",
      reference: {
        name: "Ichiro Suzuki",
        quote: "I am a person who has the patience to do the same thing over and over.",
        image: "https://framerusercontent.com/images/XciVg31ll4dQNUSyVENg9XtVM.webp?width=780&height=798",
        rotation: -1,
      },
    },
    {
      id: "008",
      statement: "Excellence comes from discipline, not talent.",
      reference: {
        name: "Johann Sebastian Bach",
        quote: "I was obliged to be industrious. Whoever is equally industrious will succeed equally well.",
        image: "https://framerusercontent.com/images/W3aKkL7WyPbGJs3iQYnyiGiisU.jpg?width=1376&height=1786",
        rotation: -3,
      },
    },
    {
      id: "009",
      statement: "If it costs nothing, it means nothing.",
      reference: {
        name: "Dietrich Bonhoeffer",
        quote: "Such grace is costly because it calls us to follow... it is costly because it costs a man his life.",
        image: "https://framerusercontent.com/images/IETeOjNDjelmjqpppvablTUXIE.jpg?width=1461&height=2048",
        rotation: -6,
      },
    },
    {
      id: "010",
      statement: "Do what is right. Not what is easy.",
      reference: {
        name: "Rosa Parks",
        quote: "You must never be fearful about what you are doing when it is right.",
        image: "https://framerusercontent.com/images/a6bpDx2p67hgp8uQUPDIhUw1oek.jpeg?width=188&height=268",
        rotation: 4,
      },
    },
    {
      id: "011",
      statement: "Fail. Learn. Fail. Learn.",
      reference: {
        name: "Michael Jordan",
        quote: "I’ve failed over and over and over again in my life. And that is why I succeed.",
        image: "https://framerusercontent.com/images/GIEJqpWERzcywk8h2JE2tJ56U.jpg?width=408&height=372",
        rotation: -6,
      },
    },
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
