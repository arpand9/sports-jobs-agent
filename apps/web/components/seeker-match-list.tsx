import Link from "next/link";

type JobMatch = {
  jobId: string;
  title: string;
  organization?: string;
  sport?: string | null;
  location?: string | null;
  totalScore: number;
};

export function SeekerMatchList({ jobs }: { jobs: JobMatch[] }) {
  if (!jobs.length) {
    return (
      <p className="glass rounded-3xl p-8 text-center text-[var(--muted)]">
        no matches yet — complete your profile or lower the score threshold
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job, i) => (
        <Link
          key={job.jobId}
          href={`/employer/jobs/${job.jobId}`}
          className="glass flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5 transition hover:border-[var(--lime)]/40"
        >
          <div>
            <span className="text-xs font-bold text-[var(--muted)]">#{i + 1} match</span>
            <h3 className="font-display text-xl font-bold">{job.title}</h3>
            <p className="text-sm text-[var(--muted)]">
              {job.organization}
              {job.location ? ` · ${job.location}` : ""}
            </p>
          </div>
          <div className="text-right">
            <div
              className="font-display text-4xl font-extrabold"
              style={{
                color:
                  job.totalScore >= 75
                    ? "var(--lime)"
                    : job.totalScore >= 50
                      ? "var(--cyan)"
                      : "var(--pink)",
              }}
            >
              {job.totalScore}
            </div>
            <div className="text-xs uppercase text-white/50">fit score</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
