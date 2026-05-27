"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f] px-6 text-center text-white">
      <span className="sticker sticker-pink">something broke</span>
      <h1 className="font-display mt-6 text-3xl font-extrabold">server hiccup</h1>
      <p className="mt-3 max-w-md text-sm text-white/60">
        Usually a cold database connection. Try again — if it keeps happening, the DB may
        still be waking up.
      </p>
      {error.digest ? (
        <p className="mono mt-2 text-xs text-white/40">digest: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex gap-4">
        <button type="button" onClick={reset} className="btn-primary">
          try again
        </button>
        <Link href="/" className="btn-ghost">
          home
        </Link>
      </div>
    </div>
  );
}
