import Link from "next/link";

export function SiteShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: "home" | "jobs" | "mcp";
}) {
  return (
    <div className="relative z-10 min-h-screen">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0c0618]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="group flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-[var(--pink)] text-lg shadow-[3px_3px_0_#000] transition group-hover:-translate-y-0.5">
              ⚡
            </span>
            <span className="font-display text-xl font-extrabold">
              Sports<span className="gradient-text">Hire</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/seeker/dashboard"
              className="hidden rounded-full px-3 py-1.5 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--lime)] sm:inline"
            >
              seeker
            </Link>
            <Link
              href="/employer/dashboard"
              className="hidden rounded-full px-3 py-1.5 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--pink)] sm:inline"
            >
              employer
            </Link>
            <Link
              href="/jobs"
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                active === "jobs"
                  ? "bg-white/15 text-white"
                  : "text-[var(--muted)] hover:text-white"
              }`}
            >
              gigs
            </Link>
            <Link
              href="/mcp"
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                active === "mcp"
                  ? "bg-white/15 text-white"
                  : "text-[var(--muted)] hover:text-white"
              }`}
            >
              agent mode
            </Link>
            <Link
              href="/playground"
              className="hidden rounded-full px-3 py-1.5 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--lime)] sm:inline"
            >
              live tools
            </Link>
            <Link href="/jobs" className="btn-primary hidden text-sm sm:inline-flex">
              find your fit →
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="mx-auto max-w-6xl border-t border-white/10 px-5 py-10 text-center text-sm text-[var(--muted)]">
        <p className="font-display text-lg font-bold text-white/90">
          built different. hired faster. 🏀
        </p>
        <p className="mt-2">
          Sports Hack 2026 · MCP-native ·{" "}
          <a
            href="https://github.com/arpand9/sports-jobs-agent"
            className="text-[var(--cyan)] underline-offset-2 hover:underline"
          >
            @arpand9
          </a>
        </p>
      </footer>
    </div>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--lime)]"
    >
      <span aria-hidden>←</span> {label}
    </Link>
  );
}

export function PageTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-10">
      {eyebrow ? (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="sticker sticker-lime">{eyebrow}</span>
        </div>
      ) : null}
      <h1 className="font-display text-4xl font-extrabold leading-[1.05] md:text-5xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
