/** Studio inbound email — mailto links and default CONTACT_TO_EMAIL for /api/contact. */
export const STUDIO_CONTACT_EMAIL = "hello@studio-finity.com";

export function studioContactMailtoHref(): string {
  return `mailto:${STUDIO_CONTACT_EMAIL}`;
}
