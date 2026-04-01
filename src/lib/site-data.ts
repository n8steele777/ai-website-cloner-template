import type { NavLink, StudioAboutContent } from "@/types/offmenu";
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
  {label: "Terms of Service", href: "/terms", disabled: true},
];

export const studioFinityAboutContent: StudioAboutContent = {
  hero:
    "We shape brands and build visual work with the same level of precision. From identity systems to digital experiences, campaigns, and films, Studio Finity creates work with clear ideas, sharp execution, and a finish that holds weight.",
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
