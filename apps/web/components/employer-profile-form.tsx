"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ORG_TYPES, SPORTS } from "@/lib/constants";

type Employer = {
  id: string;
  organizationName: string;
  orgType: string | null;
  sport: string | null;
  league: string | null;
  location: string | null;
  website: string | null;
  description: string | null;
  employeeCountRange: string | null;
};

export function EmployerProfileForm({ initial }: { initial: Employer }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/employer/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="glass max-w-2xl space-y-4 rounded-3xl p-6">
      <h2 className="font-display text-xl font-bold">organization profile</h2>
      {[
        ["organizationName", "Organization name"],
        ["location", "Location"],
        ["league", "League"],
        ["website", "Website"],
      ].map(([key, label]) => (
        <label key={key} className="block text-sm">
          <span className="font-semibold text-[var(--muted)]">{label}</span>
          <input
            value={String(form[key as keyof Employer] ?? "")}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="mt-1 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white"
          />
        </label>
      ))}
      <label className="block text-sm">
        <span className="font-semibold text-[var(--muted)]">Org type</span>
        <select
          value={form.orgType ?? ""}
          onChange={(e) => setForm({ ...form, orgType: e.target.value })}
          className="mt-1 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white"
        >
          {ORG_TYPES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-semibold text-[var(--muted)]">Primary sport</span>
        <select
          value={form.sport ?? ""}
          onChange={(e) => setForm({ ...form, sport: e.target.value })}
          className="mt-1 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white"
        >
          {SPORTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-semibold text-[var(--muted)]">About</span>
        <textarea
          rows={4}
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="mt-1 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white"
        />
      </label>
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "saving…" : "save profile"}
      </button>
    </form>
  );
}
