import { findBestCandidates } from "@sportshire/services";

const jobId = process.argv[2] ?? "9d57c400-4296-4e5f-a756-ce5fd8b68912";

findBestCandidates({ job_id: jobId, limit: 3 }).then((r) => {
  console.log(JSON.stringify(r, null, 2));
  process.exit(0);
});
