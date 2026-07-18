const base = String(process.env.PAGES_URL || "https://matt-bat.github.io/habitat-sim/").replace(/\/?$/, "/");
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

let html = "";
let lastError;
for (let attempt = 1; attempt <= 12; attempt += 1) {
  try {
    const response = await fetch(base, { redirect: "follow", cache: "no-store" });
    if (!response.ok) throw new Error(`HTML returned ${response.status}`);
    html = await response.text();
    if (!html.includes('id="root"') || !html.includes("/habitat-sim/assets/")) throw new Error("Deployed HTML is missing the app root or repository-base assets.");
    lastError = undefined;
    break;
  } catch (error) {
    lastError = error;
    if (attempt < 12) await pause(5000);
  }
}
if (lastError) throw lastError;

const assetPaths = [...html.matchAll(/(?:src|href)="([^"]+\/assets\/[^"]+)"/g)].map((match) => match[1]);
if (assetPaths.length < 2) throw new Error("Expected JavaScript and CSS assets in the deployed HTML.");
for (const path of assetPaths) {
  const url = new URL(path, base);
  const response = await fetch(url, { redirect: "follow", cache: "no-store" });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
}
console.log(`Verified ${base} and ${assetPaths.length} generated assets.`);
