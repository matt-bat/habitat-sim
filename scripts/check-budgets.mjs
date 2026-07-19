import { readdir, readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const assetDirectory = resolve(process.argv[2] || "dist/assets");
const limits = {
  ".js": { label: "JavaScript", gzipBytes: 120_000 },
  ".css": { label: "CSS", gzipBytes: 20_000 }
};

const entries = await readdir(assetDirectory, { withFileTypes: true, recursive: true });
const totals = new Map(Object.keys(limits).map((extension) => [extension, { rawBytes: 0, gzipBytes: 0, files: 0 }]));

for (const entry of entries) {
  if (!entry.isFile()) continue;
  const extension = extname(entry.name);
  if (!totals.has(extension)) continue;
  const source = await readFile(resolve(entry.parentPath, entry.name));
  const total = totals.get(extension);
  total.rawBytes += source.byteLength;
  total.gzipBytes += gzipSync(source, { level: 9 }).byteLength;
  total.files += 1;
}

const failures = [];
for (const [extension, limit] of Object.entries(limits)) {
  const total = totals.get(extension);
  if (!total.files) failures.push(`${limit.label}: no ${extension} assets found in ${assetDirectory}`);
  if (total.gzipBytes > limit.gzipBytes) failures.push(`${limit.label}: ${total.gzipBytes} gzip bytes exceeds ${limit.gzipBytes}`);
}

const report = Object.fromEntries(Object.entries(limits).map(([extension, limit]) => {
  const total = totals.get(extension);
  return [limit.label, {
    files: total.files,
    rawBytes: total.rawBytes,
    gzipBytes: total.gzipBytes,
    gzipKilobytes: Number((total.gzipBytes / 1000).toFixed(2)),
    limitKilobytes: limit.gzipBytes / 1000,
    remainingKilobytes: Number(((limit.gzipBytes - total.gzipBytes) / 1000).toFixed(2))
  }];
}));

process.stdout.write(`${JSON.stringify({ assetDirectory, budgets: report, failures }, null, 2)}\n`);
if (failures.length) process.exitCode = 1;
