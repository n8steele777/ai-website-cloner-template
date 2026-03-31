import type { Metadata } from "next";
import { CosmosHomepage } from "@/components/cosmos-homepage";
import { cosmosHomepageData } from "@/lib/cosmos-data";

export const metadata: Metadata = {
  title: "Studio Finity",
  description: "Studio Finity homepage built on a Cosmos-style editorial landing page shell.",
};

export default function Home() {
  return <CosmosHomepage data={cosmosHomepageData} />;
}
