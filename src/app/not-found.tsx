import Link from "next/link";
import { StudioFinityHeader } from "@/components/studio-finity-header";
import { offMenuWorkNavigationLinks } from "@/lib/site-data";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <StudioFinityHeader links={offMenuWorkNavigationLinks} />
      <main
        id="main-content"
        className="mx-auto flex max-w-2xl flex-col gap-8 px-6 pb-24 pt-32 md:px-8 md:pt-40"
      >
        <p className="sf-eyebrow text-muted-foreground">404</p>
        <h1 className="sf-title-xl text-balance">This page isn’t on the menu</h1>
        <p className="sf-body-copy max-w-md text-muted-foreground">
          The link may be broken or the page may have moved. Head back to the studio or browse
          work.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/"
            className="sf-caption inline-flex items-center justify-center rounded-full border border-foreground bg-foreground px-6 py-3 text-background transition-opacity hover:opacity-85"
          >
            Home
          </Link>
          <Link
            href="/work"
            className="sf-caption inline-flex items-center justify-center rounded-full border border-foreground/20 px-6 py-3 transition-opacity hover:opacity-70"
          >
            Work
          </Link>
        </div>
      </main>
    </div>
  );
}
