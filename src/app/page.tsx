import type { Metadata } from "next";
import { CosmosHomepage } from "@/components/cosmos-homepage";
import { cosmosHomepageData } from "@/lib/cosmos-data";

export const metadata: Metadata = {
  title: "Studio Finity",
  description: "Studio Finity homepage with an editorial landing page experience.",
};

export default function Home() {
  return <CosmosHomepage data={cosmosHomepageData} />;
}
