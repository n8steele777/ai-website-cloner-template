import { createClient } from "next-sanity";

const DEV_FALLBACK_PROJECT_ID = "wbz8u7w5";
const DEV_FALLBACK_DATASET = "production";

function isVercelDeployment(): boolean {
  return process.env.VERCEL === "1";
}

function getSanityProjectId(): string {
  const id = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  if (id) {
    return id;
  }
  if (process.env.NODE_ENV === "production" && isVercelDeployment()) {
    throw new Error(
      "NEXT_PUBLIC_SANITY_PROJECT_ID is required on Vercel. Set it in Project → Environment Variables (see docs/deployment.md).",
    );
  }
  return DEV_FALLBACK_PROJECT_ID;
}

function getSanityDataset(): string {
  const ds = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim();
  if (ds) {
    return ds;
  }
  if (process.env.NODE_ENV === "production" && isVercelDeployment()) {
    throw new Error(
      "NEXT_PUBLIC_SANITY_DATASET is required on Vercel. Set it in Project → Environment Variables (see docs/deployment.md).",
    );
  }
  return DEV_FALLBACK_DATASET;
}

export const client = createClient({
  projectId: getSanityProjectId(),
  dataset: getSanityDataset(),
  apiVersion: "2024-01-01",
  useCdn: process.env.NEXT_PUBLIC_SANITY_USE_CDN === "true",
});
