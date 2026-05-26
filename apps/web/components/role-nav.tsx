import Link from "next/link";

export function RoleNav({
  role,
  active,
}: {
  role: "seeker" | "employer";
  active: string;
}) {
  const links =
    role === "seeker"
      ? [
          { href: "/seeker/dashboard", label: "dashboard" },
          { href: "/seeker/profile", label: "my profile" },
          { href: "/seeker/jobs", label: "find gigs" },
        ]
      : [
          { href: "/employer/dashboard", label: "dashboard" },
          { href: "/employer/profile", label: "org profile" },
          { href: "/employer/jobs/new", label: "post a gig" },
        ];

  return (
    <nav className="mb-8 flex flex-wrap gap-2">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            active === l.href
              ? "bg-[var(--lime)] text-[#0c0618]"
              : "bg-white/10 text-[var(--muted)] hover:text-white"
          }`}
        >
          {l.label}
        </Link>
      ))}
      <Link href="/demo" className="rounded-full px-4 py-2 text-sm text-[var(--pink)]">
        switch persona
      </Link>
    </nav>
  );
}
