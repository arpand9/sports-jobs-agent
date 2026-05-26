"use client";

import type { SeekerProfileData } from "@sportshire/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { JOB_TYPES, REMOTE_PREFS, SKILL_LEVELS, SPORTS } from "@/lib/constants";
import { ProfileCompletenessWidget } from "./profile-completeness-widget";

const STEPS = ["basics", "sports", "skills", "history", "review"] as const;

type Props = {
  initial: SeekerProfileData;
  initialCompleteness: { score: number; items: { id: string; label: string; done: boolean; weight: number }[] };
};

export function SeekerProfileBuilder({ initial, initialCompleteness }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [completeness, setCompleteness] = useState(initialCompleteness);
  const [form, setForm] = useState({
    fullName: initial.fullName,
    headline: initial.headline ?? "",
    location: initial.location ?? "",
    remotePreference: "flexible",
    willingToRelocate: false,
    summary: initial.summary ?? "",
    yearsExperience: initial.yearsExperience ?? 0,
    sports: [...initial.sports],
    skills: [...initial.skills],
    jobTypes: [...initial.jobTypes],
    desiredRoles: [...initial.desiredRoles],
    experience: [...initial.experience],
    education: [...initial.education],
    certifications: [...initial.certifications],
  });

  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState("intermediate");
  const [roleInput, setRoleInput] = useState("");

  async function save(partial?: Partial<typeof form>) {
    setSaving(true);
    const payload = { ...form, ...partial };
    const res = await fetch("/api/seeker/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.ok) {
      setCompleteness(data.completeness);
    }
    setSaving(false);
    return data.ok;
  }

  async function finish() {
    const ok = await save();
    if (ok) router.push("/seeker/dashboard");
  }

  function toggleSport(sport: string) {
    setForm((f) => ({
      ...f,
      sports: f.sports.includes(sport)
        ? f.sports.filter((s) => s !== sport)
        : [...f.sports, sport],
    }));
  }

  function addSkill() {
    if (!skillName.trim()) return;
    setForm((f) => ({
      ...f,
      skills: [...f.skills, { name: skillName.trim(), level: skillLevel as never, years: 1 }],
    }));
    setSkillName("");
  }

  function addRole() {
    if (!roleInput.trim()) return;
    setForm((f) => ({ ...f, desiredRoles: [...f.desiredRoles, roleInput.trim()] }));
    setRoleInput("");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-6 flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(i)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase ${
                step === i
                  ? "bg-[var(--lime)] text-[#0c0618]"
                  : "bg-white/10 text-[var(--muted)]"
              }`}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>

        <div className="glass rounded-3xl p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">the basics</h2>
              {[
                ["fullName", "Full name", "text"],
                ["headline", "Headline", "text"],
                ["location", "Location", "text"],
                ["summary", "Summary", "textarea"],
              ].map(([key, label, type]) => (
                <label key={key} className="block text-sm">
                  <span className="font-semibold text-[var(--muted)]">{label}</span>
                  {type === "textarea" ? (
                    <textarea
                      rows={4}
                      value={form[key as keyof typeof form] as string}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white"
                    />
                  ) : (
                    <input
                      value={String(form[key as keyof typeof form] ?? "")}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [key]: key === "yearsExperience" ? Number(e.target.value) : e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white"
                    />
                  )}
                </label>
              ))}
              <label className="block text-sm">
                <span className="font-semibold text-[var(--muted)]">Years experience</span>
                <input
                  type="number"
                  min={0}
                  value={form.yearsExperience}
                  onChange={(e) => setForm({ ...form, yearsExperience: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white"
                />
              </label>
              <label className="block text-sm">
                <span className="font-semibold text-[var(--muted)]">Remote preference</span>
                <select
                  value={form.remotePreference}
                  onChange={(e) => setForm({ ...form, remotePreference: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white"
                >
                  {REMOTE_PREFS.map((r) => (
                    <option key={r} value={r}>
                      {r.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">sports & roles</h2>
              <div className="flex flex-wrap gap-2">
                {SPORTS.map((sport) => (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => toggleSport(sport)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      form.sports.includes(sport)
                        ? "bg-[var(--pink)] text-white"
                        : "bg-white/10 text-[var(--muted)]"
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
              <div>
                <span className="text-sm font-semibold text-[var(--muted)]">Job types</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {JOB_TYPES.map((jt) => (
                    <button
                      key={jt}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          jobTypes: f.jobTypes.includes(jt)
                            ? f.jobTypes.filter((x) => x !== jt)
                            : [...f.jobTypes, jt],
                        }))
                      }
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        form.jobTypes.includes(jt) ? "sticker sticker-lime" : "bg-white/10"
                      }`}
                    >
                      {jt.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  placeholder="Desired role"
                  className="flex-1 rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white"
                />
                <button type="button" onClick={addRole} className="btn-ghost text-sm">
                  add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.desiredRoles.map((r) => (
                  <span key={r} className="rounded-full bg-white/10 px-3 py-1 text-sm">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">skills</h2>
              <div className="flex flex-wrap gap-2">
                <input
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="Skill name"
                  className="min-w-[140px] flex-1 rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white"
                />
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="rounded-xl border border-white/20 bg-black/30 px-4 py-2 text-white"
                >
                  {SKILL_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={addSkill} className="btn-primary text-sm">
                  add skill
                </button>
              </div>
              <ul className="space-y-2">
                {form.skills.map((sk, i) => (
                  <li
                    key={`${sk.name}-${i}`}
                    className="flex justify-between rounded-xl bg-white/5 px-4 py-2 text-sm"
                  >
                    <span>
                      {sk.name} · <span className="text-[var(--muted)]">{sk.level}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, skills: f.skills.filter((_, j) => j !== i) }))
                      }
                      className="text-[var(--pink)]"
                    >
                      remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">experience & education</h2>
              <p className="text-sm text-[var(--muted)]">
                seeded demo data is pre-filled — edit in a future version. add summary & skills
                above for best matches.
              </p>
              <pre className="max-h-48 overflow-auto rounded-xl bg-black/40 p-4 text-xs text-[var(--cyan)]">
                {JSON.stringify({ experience: form.experience, education: form.education }, null, 2)}
              </pre>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">review & ship</h2>
              <pre className="max-h-64 overflow-auto rounded-xl bg-black/40 p-4 text-xs text-white/80">
                {JSON.stringify(form, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
              className="btn-ghost text-sm disabled:opacity-40"
            >
              back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={async () => {
                  await save();
                  setStep((s) => s + 1);
                }}
                disabled={saving}
                className="btn-primary text-sm"
              >
                {saving ? "saving…" : "save & next →"}
              </button>
            ) : (
              <button type="button" onClick={finish} disabled={saving} className="btn-primary text-sm">
                {saving ? "saving…" : "save & view matches →"}
              </button>
            )}
          </div>
        </div>
      </div>

      <ProfileCompletenessWidget score={completeness.score} items={completeness.items} />
    </div>
  );
}
