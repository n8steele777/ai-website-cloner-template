import type { CosmosHomepageData } from "@/types/cosmos";
import {
  buildSanityCdnImageUrl,
  COSMOS_HERO_SPIRAL_CDN_WIDTH,
} from "@/lib/sanity-cdn-url";
import { studioContactMailtoHref } from "@/lib/studio-contact";
import { studioFinityAboutContent } from "@/lib/site-data";

const COSMOS_HERO_CARD_WIDTH = 1200;
const COSMOS_FILM_POSTER_WIDTH = 960;

const contactHref = studioContactMailtoHref();
export const homepageFeaturedWorkSlugs = [
  "on",
  "baxo",
  "area-15-ventures",
  "milk-tea-people",
];

/** Base CDN URLs (no query string); canonical params applied in `buildCosmosHomepageData`. */
const HERO_SPIRAL_IMAGE_BASE_URLS = [
  "https://cdn.sanity.io/images/ca81n2nu/production/7026c0a59bdc2f33601fa4cb0cea34762ff78852-1169x1169.png",
  "https://cdn.sanity.io/images/ca81n2nu/production/aaf0b975205e35fff749952bd670d0096226e9f6-682x682.png",
  "https://cdn.sanity.io/images/ca81n2nu/production/554d9c08eadb46abb34a9fe662fbde49b3eeac91-1440x2160.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/a0a81469eabaeba10aa9f08654c1ddfa6fca5ef9-1440x2159.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/acfe7fac945ac4011bf9c2f629321d40dc83dbf5-1280x1707.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/44e4c54ae8bce687bfb5124d7f75c2567e77623f-1440x1800.png",
  "https://cdn.sanity.io/images/ca81n2nu/production/a963d5b8ecc8dbef3e1a2d98dcb7e2abcd962062-1280x1924.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/c72fd507e851d1d06598c6a2257f2b9a83c32b46-1280x1917.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/522baade0269bfaddab00262781e2c176c8712d0-1280x1635.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/c1ac98985729628340ca7e10459dcb6b02f3a7f2-1280x1920.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/ff740224fb03de96cd8eaff540abd5de00ed0b77-1280x1920.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/8a85eca1517c6d7d5bfd9c75f432081b274942b1-1280x1920.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/d008005ba7abc5228778b3d586d72d2a151e26e8-1280x854.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/d4cee1b081dc846c5488e15e10dc9acd5d29489b-1280x1919.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/0b9302744a47745bca3da433b1a08fa8792d6486-1440x1920.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/3ad7dbd6c60e8d619aed62d405ebbfe78552c48c-1440x1800.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/ce2df4a75463848fc979dff5a30bee4abe600d3a-1440x1799.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/10ff72387b83780a1941827f14103e358788e9a9-1440x2016.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/07fb17bce459cbeeb2eeae07d7730ae0662b9a3e-1440x2160.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/9f756b4ae268661fd014ea72c8aca7dbb0a4b3a3-1440x2160.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/110310adc836d7c9ff52ee8d3982453a1111dcaf-1280x853.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/b81072d80c6707cf52f1fd25df242d5213b053af-1280x1600.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/78dec336d983d1eb6433619080320d5686102f40-1280x1600.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/fe9978b06a4cd32cf4b33c873c138f3016b1c93f-1280x1707.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/3ed15e70ad642003f7f44a9033881fb479fe6dbb-1280x1600.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/449691abea1ad31f66383c869172cb517c2aeea7-1280x1600.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/1ad34479e4f7e735d675e1703547679018426004-1280x1600.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/0e77c18ee0a12231570991422bcebc2915f8b406-1280x1600.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/d15386ccc2235cb755d812b1661d809d2fd878a9-1280x1600.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/b4f91e4d57cdcfa16b0aaabba8473a7017806981-1280x853.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/fb146d1117a535c8a3b447a094fe9eee02799655-1280x1707.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/57caf9abc98a07c4fe19b46712380bea53269a94-1280x1600.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/26a985fa943ba67106fc8741f7b108fc973fdcff-1280x1024.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/c97988433a13cfd3d647c42f4a576c336099820b-1280x1920.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/ca4df282070b1651e6029b6b0adaf4d60544b108-1280x1919.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/638dc3c25a1d81bd0513baa891f6db50415f347e-1280x1919.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/a4695c6ade31d394c5209edf088bc554057d765e-1280x1919.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/2e67fb9dbda636f23a0a282cd605d6c5f0e6c960-1440x2160.png",
  "https://cdn.sanity.io/images/ca81n2nu/production/1bd26e6d19f0d5d07f55b59795ceffabc49e55d3-1440x1803.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/67a27de3d6d3f3dbb122fd49aad29d4286f2e33e-1440x1434.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/01a00892e06c9a2e3e2163b86b3f2610904e42c9-1440x1800.png",
  "https://cdn.sanity.io/images/ca81n2nu/production/15e23170f6f0bb6936f7fa9d89fe4afb375c6130-1440x1920.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/92da1cd0a6a7fe6fe0d218dd92a449948cd27aea-1342x1677.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/b294f8481e99489e0f29ea557d10664a2c8d3fc4-1280x853.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/9386af6c23520f09f445ff11125116470d3f5192-1280x1493.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/c2144b8c4ba20b88c450e6d6273b71ff8ac8f4cb-1440x1800.png",
  "https://cdn.sanity.io/images/ca81n2nu/production/ed39aa048f6146cb512a236e1219b31a5257bb04-1440x1800.png",
  "https://cdn.sanity.io/images/ca81n2nu/production/da1bdd00d0a676d4e9fa9d0111b5a1d3612b3efe-1280x914.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/f94b4c48d37a72b3809d1c17b330627ef5c07546-1280x1280.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/8dd30cad0bcdb2cc6db5c992cf04db874e3c0c5e-1280x853.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/8a14d26c58554ef13d43f0441204eadf14b3826f-1280x1742.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/9fa79fad02485cfa67e78f3d719b4f1b0a8685c1-1024x688.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/140b19f872c1bbb75e7703a6278bee69e1737346-599x800.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/a2ee2ca1134a1419cc42b1080652b2222946a15d-1280x1920.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/d8390ff4bae1dcf2d3cd8ed675d1d3c63a6f7d19-1280x1920.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/b560acba32a836735a2250c8ae5be47617219059-1440x1440.webp",
  "https://cdn.sanity.io/images/ca81n2nu/production/1004521ab8268a029b98dd0957e1cd9e6aa4155a-1440x1440.webp",
  "https://cdn.sanity.io/images/ca81n2nu/production/2406d713bba27258180ffb5ae4fa19fdf9f38559-1280x1920.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/d07833da80f617bd3161c66366c258b54e55efc7-1440x1803.jpg",
  "https://cdn.sanity.io/images/ca81n2nu/production/f1cc07426c3d1cde1a938b4b8916ee3cf4f10f46-1440x1119.jpg",
] as const;

const HERO_MEDIA_ENTRIES = [
  {
    base: "https://cdn.sanity.io/images/ca81n2nu/production/4400bda550b1fb82e286777fd39f62d24c7daa5a-1516x2212.png",
    alt: "Editorial collage card",
  },
  {
    base: "https://cdn.sanity.io/images/ca81n2nu/production/debf547a545661eaf7e4e7b3b6cff1e40ab7a18b-1048x1312.png",
    alt: "Interior detail card",
  },
  {
    base: "https://cdn.sanity.io/images/ca81n2nu/production/3b58bec33141d2e8e26750651711b0ed3ea352c9-1040x1560.png",
    alt: "Portrait collage card",
  },
  {
    base: "https://cdn.sanity.io/images/ca81n2nu/production/503c057fa2b78012af824220976153651323efca-764x1644.png",
    alt: "Tall editorial card",
  },
  {
    base: "https://cdn.sanity.io/images/ca81n2nu/production/8f5934850f4844c6be14461b7e5f320edf17e9a4-692x1272.png",
    alt: "Design object card",
  },
] as const;

export function buildCosmosHomepageData(
  featuredProjects: CosmosHomepageData["featuredWork"]["projects"],
): CosmosHomepageData {
  const heroSpiralImages = HERO_SPIRAL_IMAGE_BASE_URLS.map((href) =>
    buildSanityCdnImageUrl(href, {
      w: COSMOS_HERO_SPIRAL_CDN_WIDTH,
      q: 82,
    }),
  );

  const heroMedia = HERO_MEDIA_ENTRIES.map((entry) => ({
    src: buildSanityCdnImageUrl(entry.base, { w: COSMOS_HERO_CARD_WIDTH, q: 82 }),
    alt: entry.alt,
  }));

  const filmPoster = buildSanityCdnImageUrl(HERO_MEDIA_ENTRIES[0]!.base, {
    w: COSMOS_FILM_POSTER_WIDTH,
    q: 80,
  });

  return {
    headerLinks: [
      { label: "About", href: "/about" },
      { label: "Works", href: "/work" },
      {
        label: "Contact",
        href: contactHref,
        external: true,
        opensContactForm: true,
      },
    ],
    heroTitle: "Your space for inspiration",
    heroButtons: [
      {
        label: "Get in touch",
        href: contactHref,
        external: true,
        variant: "primary",
        opensContactForm: true,
      },
      { label: "View work", href: "/work", variant: "secondary" },
    ],
    heroSpiralImages,
    heroMedia,
    filmVideo: {
      src: "https://cdn.sanity.io/files/ca81n2nu/production/a6cc82d75d824ae49ad989e7d18d3d3ec06ab431.mp4",
      alt: "Studio-finity film preview video",
      kind: "video",
      posterSrc: filmPoster,
    },
    brandIntro: {
      eyebrow: "Studio Finity",
      title: "Brand, digital, and visual work shaped with restraint.",
      body: "Studio Finity is a design studio working across brand, digital, and visual storytelling.",
      supportingText:
        "We help brands look distinct, feel elevated, and communicate with clarity, whether the audience meets them on a website, in a campaign, or in motion.",
    },
    studioAbout: {
      intro: studioFinityAboutContent.intro,
      location: studioFinityAboutContent.location,
      aboutHref: "/about",
    },
    expertiseIndustries: {
      expertiseEyebrow: "Expertise",
      expertise: [...studioFinityAboutContent.expertise],
      industriesEyebrow: "Industries",
      industries: [...studioFinityAboutContent.industries],
    },
    featuredWork: {
      eyebrow: "Selected work",
      title: "A few\nrecent\nprojects.",
      projects: featuredProjects,
    },
    contactCta: {
      eyebrow: "Contact",
      title: "If the work needs taste, clarity, and finish, let's talk.",
      supportingText:
        "Based in Denver, working wherever the right collaboration leads.",
      button: {
        label: "Contact",
        href: contactHref,
        external: true,
        variant: "primary",
        opensContactForm: true,
      },
    },
  };
}
